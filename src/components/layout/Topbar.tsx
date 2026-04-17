"use client";

import { useTabStore } from '@/store/useTabStore';
import { Omnibox } from '@/components/browser/Omnibox';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw, Home, Plus, X, Sparkles } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Topbar() {
  const { 
    tabs, 
    activeTabId, 
    setActiveTab, 
    closeTab, 
    addTab, 
    navigateBack, 
    navigateForward 
  } = useTabStore();

  const activeTab = tabs.find(t => t.id === activeTabId);

  // We need to sync tabs to local state for Reorder.Group to work properly without conflicts
  const [orderedTabs, setOrderedTabs] = useState(tabs);

  useEffect(() => {
    // Only update if tabs count or ids changed, naive diffing for now
    setOrderedTabs(tabs);
  }, [tabs]);

  const handleReorder = (newOrder: typeof tabs) => {
    setOrderedTabs(newOrder);
    // In a real app, we'd also update Zustand store with the new order here,
    // but for MVP, Reorder handles the visual state well if we only reorder.
    useTabStore.setState({ tabs: newOrder });
  };

  const currentTabStack = activeTab?.historyStack || [];
  const currentIndex = activeTab?.currentIndex || 0;
  
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < currentTabStack.length - 1;

  const [summaryStr, setSummaryStr] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!activeTab || !activeTab.url) return;
    setIsSummarizing(true);
    setSummaryStr(null);
    try {
       const res = await fetch(`/api/summarize?url=${encodeURIComponent(activeTab.url)}`);
       const data = await res.json();
       setSummaryStr(data.summary || "Failed to generate summary.");
    } catch(e) {
       setSummaryStr("API Error: summarize endpoint failed.");
    } finally {
       setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-background/70 backdrop-blur-md border-b shadow-sm z-20 sticky top-0">
      
      {/* Tab Strip */}
      <div className="flex items-end px-2 pt-2 gap-1 overflow-x-auto h-10 no-scrollbar relative w-full header-drag-region">
        <Reorder.Group 
          axis="x" 
          values={orderedTabs} 
          onReorder={handleReorder}
          className="flex gap-1 h-full items-end"
        >
          {orderedTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <Reorder.Item
                key={tab.id}
                value={tab}
                id={tab.id}
                onPointerDown={() => setActiveTab(tab.id)}
                className={cn(
                  "group relative flex items-center min-w-[120px] max-w-[200px] h-[34px] px-3 rounded-t-lg border-x border-t transition-colors cursor-default select-none",
                  isActive 
                    ? "bg-background border-border z-10 before:absolute before:-left-[1px] before:-bottom-[1px] before:w-[calc(100%+2px)] before:h-[1px] before:bg-background"
                    : "bg-muted/30 border-transparent hover:bg-muted/50 text-muted-foreground z-0"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden w-full">
                  <div className="w-4 h-4 bg-primary/20 rounded-sm shrink-0" />
                  <span className="text-xs truncate font-medium flex-1">
                    {tab.title}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center shrink-0 hover:bg-muted text-transparent group-hover:text-foreground transition-all",
                      isActive && "text-muted-foreground"
                    )}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => addTab()}
          className="h-8 w-8 rounded-full mb-1 ml-1 hover:bg-white/10"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation & Omnibox */}
      <div className="flex items-center px-4 py-2 gap-2 w-full">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={!canGoBack}
            onClick={() => activeTabId && navigateBack(activeTabId)}
            className="w-8 h-8 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={!canGoForward}
            onClick={() => activeTabId && navigateForward(activeTabId)}
            className="w-8 h-8 rounded-full"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => activeTabId && useTabStore.getState().updateTabUrl(activeTabId, activeTab!.url)} // "Reload"
            className="w-8 h-8 rounded-full"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => activeTabId && useTabStore.getState().updateTabUrl(activeTabId, 'https://example.com')}
            className="w-8 h-8 rounded-full"
          >
            <Home className="w-4 h-4" />
          </Button>
        </div>

        <Omnibox />

        <Button 
           variant="ghost" 
           size="icon"
           onClick={handleSummarize}
           disabled={isSummarizing}
           className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 shrink-0 ml-1"
        >
           <Sparkles className={`w-5 h-5 ${isSummarizing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <AnimatePresence>
        {summaryStr && (
           <motion.div 
             initial={{ opacity: 0, y: -20, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="absolute top-full right-4 mt-2 w-96 p-5 rounded-2xl bg-card border border-indigo-500/30 shadow-2xl z-50 backdrop-blur-xl"
           >
             <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-indigo-500">
                   <Sparkles className="w-4 h-4" />
                   <h3 className="font-semibold text-sm">Vibe AI Summary</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSummaryStr(null)} className="h-6 w-6">
                   <X className="w-3 h-3" />
                </Button>
             </div>
             <p className="text-sm leading-relaxed text-card-foreground font-medium">{summaryStr}</p>
           </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
