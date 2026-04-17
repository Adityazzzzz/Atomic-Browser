import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function extractSentences(text: string) {
  // basic regex splitting by punctuation
  return text.match(/[^\.!\?]+[\.!\?]+/g) || [];
}

// 100% Free and Local Network Extractive NLP algorithm mapping word frequencies
function calculateSummary(text: string, numSentences: number = 4) {
  const sentences = extractSentences(text).map(s => s.trim()).filter(s => s.length > 20);
  if (sentences.length <= numSentences) return sentences.join(' ');

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const freq: Record<string, number> = {};
  
  // Standard English Stop words
  const stopWords = new Set(['the','and','to','of','a','in','is','it','you','that','he','was','for','on','are','with','as','i','his','they','be','at','one','have','this','from','or','had','by','hot','word','but','what','some','we','can','out','other','were','all','there','when','up','use','your','how','said','an','each','she']);
  
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 2) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });

  const scoredSentences = sentences.map(sentence => {
    let score = 0;
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    sentenceWords.forEach(word => {
      if (freq[word]) score += freq[word];
    });
    // Normalize by length to penalize run-on sentences
    return { sentence, score: score / (sentenceWords.length || 1) };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  
  // Re-sort extracted top sentences back to chronological document order
  const topSentences = scoredSentences.slice(0, numSentences).map(s => s.sentence);
  return sentences.filter(s => topSentences.includes(s)).join(' ');
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  
  if (!urlParam) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const targetUrl = new URL(urlParam.startsWith('http') ? urlParam : `https://${urlParam}`);
    
    if (targetUrl.hostname.includes('localhost') || urlParam.startsWith('/search')) {
       return new NextResponse(JSON.stringify({ summary: "Internal system endpoints cannot be natively summarized by Vibe AI." }), { 
           status: 200, headers: { 'Content-Type': 'application/json' }
       });
    }

    const response = await fetch(targetUrl.href, {
       headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0' }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Strip out non-content blocks for heavy noise reduction
    $('script, style, nav, footer, header, aside, .ad, .sidebar, iframe').remove();
    
    // Attempt standard <article> tag extraction
    let mainText = $('article').text();
    if (!mainText || mainText.trim().length < 200) {
       mainText = $('main').text();
    }
    if (!mainText || mainText.trim().length < 200) {
       mainText = $('body').text();
    }

    const cleanText = mainText.replace(/\s+/g, ' ').trim();
    
    if (cleanText.length < 100) {
       return new NextResponse(JSON.stringify({ summary: "Not enough textual content found on this page to generate a viable summary." }), { 
           status: 200, headers: { 'Content-Type': 'application/json' }
       });
    }

    const summary = calculateSummary(cleanText, 3);

    return new NextResponse(JSON.stringify({ summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new NextResponse(`Summary generation failed: ${error.message}`, { status: 500 });
  }
}
