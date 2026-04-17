"use client";

import { motion } from 'framer-motion';
import { ExternalLink, Search } from 'lucide-react';

interface Result {
  title: string;
  link: string;
  snippet: string;
}

export default function ClientSearchResults({ query, initialResults }: { query: string, initialResults: Result[] }) {
  
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch(e) {
      return url;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-8">
      <div className="flex items-center gap-4 mb-12 pb-6 border-b border-border/40">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
           <Search className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Results for <span className="text-muted-foreground font-normal">"{query}"</span>
        </h1>
      </div>

      {initialResults.length === 0 ? (
        <div className="text-center py-32 text-muted-foreground bg-card/10 rounded-3xl border border-border/20">
          <p className="text-lg">No native results found.</p>
          <p className="text-sm mt-2">DuckDuckGo may have rate-limited our backend proxy, or it's an empty query.</p>
        </div>
      ) : (
        <motion.div 
          className="flex flex-col gap-8 pb-32"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {initialResults.map((result, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { 
                  opacity: 1, 
                  y: 0,
                  transition: { type: "spring", stiffness: 300, damping: 24 }
                }
              }}
              className="group flex flex-col p-6 rounded-3xl border border-border/20 hover:border-border/50 bg-card/20 shadow-sm hover:bg-card/50 hover:shadow-md transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border/50 text-[10px] font-bold text-muted-foreground uppercase overflow-hidden shrink-0">
                  {getDomain(result.link).charAt(0)}
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-accent/50 px-2.5 py-1 rounded-full">
                  {getDomain(result.link)}
                </span>
              </div>
              <a 
                href={result.link} 
                className="text-xl font-medium text-primary hover:text-primary/80 flex items-center gap-2 w-fit mb-3 transition-colors"
              >
                {result.title}
                <ExternalLink className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </a>
              <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
                {result.snippet}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
