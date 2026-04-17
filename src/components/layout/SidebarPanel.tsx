"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { useTabStore } from '@/store/useTabStore';
import { X, Clock, Bookmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function SidebarPanel() {
  const { activeSidebarPanel, closeSidebarPanel } = useUIStore();
  const { globalHistory, bookmarks, clearGlobalHistory, removeBookmark, addTab } = useTabStore();
  
  // Hydration protection for Zustand persist
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleLinkClick = (url: string) => {
    addTab(url);
    closeSidebarPanel();
  };

  return (
    <AnimatePresence>
      {activeSidebarPanel && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebarPanel}
            className="fixed inset-0 bg-background/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-16 bottom-0 w-[360px] bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/30 bg-muted/10">
              <div className="flex items-center gap-3">
                {activeSidebarPanel === 'history' ? <Clock className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5 text-primary" />}
                <h2 className="font-semibold text-lg capitalize">{activeSidebarPanel}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={closeSidebarPanel} className="h-8 w-8 rounded-full hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 custom-scrollbar">
              {activeSidebarPanel === 'history' && (
                <>
                  <div className="flex justify-end mb-2">
                     <Button variant="ghost" size="sm" onClick={clearGlobalHistory} className="text-muted-foreground text-xs h-7 hover:text-destructive">
                        Clear History
                     </Button>
                  </div>
                  {globalHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 opacity-50">
                        <Clock className="w-12 h-12 mb-4 text-muted-foreground" />
                        <p className="text-center text-sm font-medium">Your browsing history is empty.</p>
                      </div>
                  ) : (
                      globalHistory.map((item) => (
                        <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-colors border border-transparent hover:border-border/30" onClick={() => handleLinkClick(item.url)}>
                            <div className="flex flex-col overflow-hidden gap-0.5">
                                <span className="text-sm font-medium truncate text-foreground/90">{item.title}</span>
                                <span className="text-xs text-muted-foreground truncate opacity-70">
                                   {item.url.length > 50 ? item.url.substring(0, 50) + '...' : item.url}
                                </span>
                            </div>
                        </div>
                      ))
                  )}
                </>
              )}

              {activeSidebarPanel === 'bookmarks' && (
                <>
                  {bookmarks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 opacity-50">
                        <Bookmark className="w-12 h-12 mb-4 text-muted-foreground" />
                        <p className="text-center text-sm font-medium">No bookmarks saved yet.</p>
                      </div>
                  ) : (
                      bookmarks.map((item) => (
                        <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-colors border border-transparent hover:border-border/30" onClick={() => handleLinkClick(item.url)}>
                            <div className="flex flex-col overflow-hidden gap-0.5">
                                <span className="text-sm font-medium truncate text-foreground/90">{item.title}</span>
                                <span className="text-xs text-muted-foreground truncate opacity-70">
                                  {item.url.length > 40 ? item.url.substring(0, 40) + '...' : item.url}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeBookmark(item.url); }} className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                      ))
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
