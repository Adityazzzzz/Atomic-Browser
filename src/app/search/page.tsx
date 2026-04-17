import * as cheerio from 'cheerio';
import ClientSearchResults from './client-results';

export const metadata = {
  title: 'Search | VibeBrowser',
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function fetchSearchResults(query: string) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: any[] = [];
    
    $('.result').each((i, el) => {
      const titleEl = $(el).find('.result__title a');
      const title = titleEl.text().trim();
      const rawLink = titleEl.attr('href');
      
      let link = '';
      if (rawLink) {
        if (rawLink.includes('uddg=')) {
          try {
            const urlObj = new URL(rawLink, 'https://duckduckgo.com');
            const uddgParam = urlObj.searchParams.get('uddg');
            if (uddgParam) link = decodeURIComponent(uddgParam);
          } catch(e) {}
        } else {
          link = rawLink;
        }
      }
      
      const snippet = $(el).find('.result__snippet').text().trim();
      
      if (title && link) {
        results.push({ title, link, snippet });
      }
    });
    
    return results;
  } catch (err) {
    return [];
  }
}

export default async function SearchPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const qObj = searchParams.q;
  const query = Array.isArray(qObj) ? qObj[0] : (qObj || '');
  
  const initialResults = await fetchSearchResults(query);

  return (
    <div className="w-full min-h-screen bg-background/50 overflow-y-auto">
      <ClientSearchResults query={query} initialResults={initialResults} />
    </div>
  );
}
