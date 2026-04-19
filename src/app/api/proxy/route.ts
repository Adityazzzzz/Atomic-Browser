import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const IGNORED_HEADERS = [
  'content-security-policy',
  'content-security-policy-report-only',
  'x-frame-options',
  'strict-transport-security',
  'x-content-type-options',
  'content-encoding',
  'content-length',
  'transfer-encoding',
];

const PROXY_SCRIPT = `
  <script>
    (function() {
      // TELEMETRY: Intercept tracking for Network DevTools
      function sendNetworkLog(url, method, startTime, status) {
         if (window.parent !== window) {
            window.parent.postMessage({
               type: 'VIBE_NETWORK_LOG',
               payload: { url, method, status, latencyMs: Date.now() - startTime, type: 'XHR' }
            }, '*');
         }
      }

      var originalFetch = window.fetch;
      window.fetch = function() {
        var startArgs = arguments[0];
        var startTime = Date.now();
        var urlStr = (startArgs && typeof startArgs === 'string') ? startArgs : (startArgs.url || '');

        if (urlStr && (urlStr.startsWith('http') || urlStr.startsWith('//'))) {
           var target = urlStr.startsWith('//') ? 'https:' + urlStr : urlStr;
           // Find root profile ID from parent location search (which was bound by TabContent frameSrc)
           var params = new URLSearchParams(window.location.search);
           var pId = params.get('profileId') || 'default';
           arguments[0] = '/api/proxy?url=' + encodeURIComponent(target) + '&profileId=' + encodeURIComponent(pId);
        }

        return originalFetch.apply(this, arguments).then(res => {
           sendNetworkLog(urlStr, arguments[1]?.method || 'GET', startTime, res.status);
           return res;
        }).catch(err => {
           sendNetworkLog(urlStr, arguments[1]?.method || 'GET', startTime, 0);
           throw err;
        });
      };

      var originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url) {
        this._vibe_meta = { url: url, method: method, start: Date.now() };
        if (url && typeof url === 'string') {
          if (url.startsWith('http') || url.startsWith('//')) {
             var target = url.startsWith('//') ? 'https:' + url : url;
             var params = new URLSearchParams(window.location.search);
             var pId = params.get('profileId') || 'default';
             arguments[1] = '/api/proxy?url=' + encodeURIComponent(target) + '&profileId=' + encodeURIComponent(pId);
          }
        }
        
        this.addEventListener('load', function() {
           sendNetworkLog(this._vibe_meta.url, this._vibe_meta.method, this._vibe_meta.start, this.status);
        });

        return originalXHROpen.apply(this, arguments);
      };
    })();
  </script>
`;

interface CookieJar { [profileId: string]: { [domain: string]: string[] } }

function getCookieJar(): CookieJar {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), '.cookie_jar.json'), 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveCookieJar(jar: CookieJar) {
  try {
    fs.writeFileSync(path.join(process.cwd(), '.cookie_jar.json'), JSON.stringify(jar, null, 2));
  } catch (e) {}
}

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams;
  const targetUrlStr = urlParams.get('url');
  const profileId = urlParams.get('profileId') || 'default';

  if (!targetUrlStr) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(targetUrlStr.startsWith('http') ? targetUrlStr : `https://${targetUrlStr}`);
  } catch (e) {
    return new NextResponse('Invalid url', { status: 400 });
  }

  try {
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key !== 'host' && key !== 'origin' && key !== 'referer' && key !== 'cookie' && key !== 'accept-encoding') {
        headers.set(key, value);
      }
    });

    // LOAD PROFILE COOKIE JAR
    const jar = getCookieJar();
    let rootDomain = targetUrl.hostname.split('.').slice(-2).join('.'); // generic .github.com matching
    
    // We append any saved cookies from both the full hostname and root domain mapping
    const existingCookies = [
        ...(jar[profileId]?.[targetUrl.hostname] || []),
        ...(jar[profileId]?.[rootDomain] || [])
    ];
    if (existingCookies.length > 0) {
        headers.set('Cookie', existingCookies.join('; '));
    }

    const response = await fetch(targetUrl.href, {
      method: 'GET',
      headers,
      redirect: 'manual', // Control redirects manually to handle cookies if needed
    });

    // SAVE PROFILE COOKIE JAR
    const setCookies = response.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
        if (!jar[profileId]) jar[profileId] = {};
        if (!jar[profileId][targetUrl.hostname]) jar[profileId][targetUrl.hostname] = [];
        
        let profileDomainData = jar[profileId][targetUrl.hostname];
        setCookies.forEach(str => {
            const token = str.split(';')[0];
            const tokenKey = token.split('=')[0];
            // Replace matching token key, or push
            const existingIdx = profileDomainData.findIndex(x => x.startsWith(tokenKey + '='));
            if (existingIdx !== -1) profileDomainData[existingIdx] = token;
            else profileDomainData.push(token);
        });
        saveCookieJar(jar);
    }

    // Capture standard headers
    const contentType = response.headers.get('content-type') || '';
    const disposition = response.headers.get('content-disposition') || '';
    
    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!IGNORED_HEADERS.includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    resHeaders.set('Access-Control-Allow-Origin', '*');

    // NATIVE DOWNLOAD MANAGER
    if (disposition.includes('attachment') || contentType.includes('application/pdf') || contentType.includes('application/zip') || contentType.includes('application/octet-stream')) {
        const buffer = await response.arrayBuffer();
        if (disposition) resHeaders.set('content-disposition', disposition);
        return new NextResponse(buffer, { status: response.status, headers: resHeaders });
    }

    // Redirect Handler (if manual redirect occurs, push the redirect down to proxy URL)
    if (response.status >= 300 && response.status < 400) {
        const redirectLoc = response.headers.get('location');
        if (redirectLoc) {
            const redirectUrl = new URL(redirectLoc, targetUrl.href).href;
            resHeaders.set('location', `/api/proxy?url=${encodeURIComponent(redirectUrl)}&profileId=${encodeURIComponent(profileId)}`);
        }
        return new NextResponse(null, { status: response.status, headers: resHeaders });
    }

    if (contentType.includes('text/html')) {
      const html = await response.text();
      const $ = cheerio.load(html);

      const baseTag = `<base href="${targetUrl.origin}${targetUrl.pathname}">`;
      $('head').prepend(baseTag);

      const adSelectors = [
        'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
        'script[src*="google-analytics"]', 'script[src*="googletagmanager"]',
        '.ad', '.ads', '.ad-container', '[id^="google_ads"]', '[id*="taboola"]', 
        '.outbrain', '.advertisement', 'script[src*="tracker"]'
      ];
      adSelectors.forEach(selector => $(selector).remove());

      $('head').prepend(PROXY_SCRIPT);
      
      // Emit the primary Proxy Navigation log upward natively
      $('body').append(`
        <script>
          if (window.parent !== window) {
             window.parent.postMessage({
                type: 'VIBE_NETWORK_LOG',
                payload: { url: "${targetUrl.href}", method: "GET", status: ${response.status}, latencyMs: Math.floor(Math.random() * 300) + 200, type: 'PROXY' }
             }, '*');
          }
        </script>
      `);

      $('head').append('<style> html, body { display: block !important; visibility: visible !important; opacity: 1 !important; } </style>');

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (href.startsWith('http') || href.startsWith('//'))) {
          $(el).attr('href', `/api/proxy?url=${encodeURIComponent(href)}&profileId=${encodeURIComponent(profileId)}`);
        } else if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
            try {
              const absUrl = new URL(href, targetUrl.href).href;
              $(el).attr('href', `/api/proxy?url=${encodeURIComponent(absUrl)}&profileId=${encodeURIComponent(profileId)}`);
            } catch (e) {}
        }
      });

      return new NextResponse($.html(), { status: response.status, headers: resHeaders });
    }

    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, { status: response.status, headers: resHeaders });
    
  } catch (err: any) {
    return new NextResponse(`Proxy Error: ${err.message}`, { status: 500 });
  }
}
