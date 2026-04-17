"use client";

import { useTabStore } from '@/store/useTabStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

function IframeWrapper({ url, isActive }: { url: string; isActive: boolean }) {
  const [loading, setLoading] = useState(true);

  // When url changes to a totally different one, we might want to trigger loading
  // For standard browser experience, iframe doesn't natively expose loading state accurately across origins
  // This is a rough estimation for UX
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800); // Fake load time
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className={cn(
      "w-full h-full absolute inset-0 bg-background transition-opacity duration-200",
      isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
    )}>
      {loading && isActive && (
        <div className="absolute inset-0 z-20 bg-background flex flex-col gap-4 p-8">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-64 w-full mt-4" />
        </div>
      )}
      {/* 
        Warning: For remote sites that return X-Frame-Options DENY, this will fail to load.
        Phase 2 will replace this with a proper remote proxy architecture or Playwright stream.
        We add sandbox attributes to restrict what the iframe can do.
      */}
      <iframe
        src={`/api/proxy?url=${encodeURIComponent(url)}`}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        title="Viewport"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}

export function TabContent() {
  const { tabs, activeTabId } = useTabStore();

  return (
    <div className="flex-1 relative bg-muted/20 overflow-hidden w-full h-full">
      {tabs.map(tab => (
        <IframeWrapper 
          key={tab.id} 
          url={tab.url} 
          isActive={tab.id === activeTabId} 
        />
      ))}
    </div>
  );
}
