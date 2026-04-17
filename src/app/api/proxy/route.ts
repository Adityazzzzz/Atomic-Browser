import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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
      var originalFetch = window.fetch;
      window.fetch = function() {
        if (arguments[0] && typeof arguments[0] === 'string') {
          if (arguments[0].startsWith('http') || arguments[0].startsWith('//')) {
            arguments[0] = '/api/proxy?url=' + encodeURIComponent(arguments[0]);
          }
        }
        return originalFetch.apply(this, arguments);
      };
      var originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url) {
        if (url && typeof url === 'string') {
          if (url.startsWith('http') || url.startsWith('//')) {
             arguments[1] = '/api/proxy?url=' + encodeURIComponent(url);
          }
        }
        return originalXHROpen.apply(this, arguments);
      };
    })();
  </script>
`;

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams;
  const targetUrlStr = urlParams.get('url');

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
      // Avoid sending local host and forbidden headers
      if (key !== 'host' && key !== 'origin' && key !== 'referer' && key !== 'cookie' && key !== 'accept-encoding') {
        headers.set(key, value);
      }
    });

    const response = await fetch(targetUrl.href, {
      method: 'GET',
      headers,
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || '';
    const disposition = response.headers.get('content-disposition') || '';
    
    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!IGNORED_HEADERS.includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    // Ensure cross-origin sharing is allowed for the iframe container
    resHeaders.set('Access-Control-Allow-Origin', '*');

    // NATIVE DOWNLOAD MANAGER
    if (disposition.includes('attachment') || contentType.includes('application/pdf') || contentType.includes('application/zip') || contentType.includes('application/octet-stream')) {
        const buffer = await response.arrayBuffer();
        if (disposition) resHeaders.set('content-disposition', disposition);
        return new NextResponse(buffer, { status: response.status, headers: resHeaders });
    }

    if (contentType.includes('text/html')) {
      const html = await response.text();
      const $ = cheerio.load(html);

      // 1. Inject base tag so relative links resolve strictly against original domain
      const baseTag = `<base href="${targetUrl.origin}${targetUrl.pathname}">`;
      $('head').prepend(baseTag);

      // DEEP-ENGINE ADBLOCK & TRACKER FILTER
      const adSelectors = [
        'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
        'script[src*="google-analytics"]', 'script[src*="googletagmanager"]',
        '.ad', '.ads', '.ad-container', '[id^="google_ads"]', '[id*="taboola"]', 
        '.outbrain', '.advertisement', 'script[src*="tracker"]'
      ];
      adSelectors.forEach(selector => $(selector).remove());

      // 2. Inject standard fetch/xhr patch to route dynamic backend API queries
      $('head').prepend(PROXY_SCRIPT);

      // Force display to counter Javascript frame-busters that set display:none
      $('head').append('<style> html, body { display: block !important; visibility: visible !important; opacity: 1 !important; } </style>');

      // 3. (Optional deeper rewrite) We modify top-level navigation links 
      //    to push through the proxy, so clicking inside the iframe doesn't "break out".
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (href.startsWith('http') || href.startsWith('//'))) {
          // If absolute link, force it through proxy
          $(el).attr('href', `/api/proxy?url=${encodeURIComponent(href)}`);
        } else if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
            // To be perfectly safe, try converting all to absolute proxied
            try {
              const absUrl = new URL(href, targetUrl.href).href;
              $(el).attr('href', `/api/proxy?url=${encodeURIComponent(absUrl)}`);
            } catch (e) {
              // ignore
            }
        }
      });

      return new NextResponse($.html(), {
        status: response.status,
        headers: resHeaders,
      });
    }

    // Direct proxy for assets (images, css, js)
    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: response.status,
      headers: resHeaders,
    });
    
  } catch (err: any) {
    return new NextResponse(`Proxy Error: ${err.message}`, { status: 500 });
  }
}
