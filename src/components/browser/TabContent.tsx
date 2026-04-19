"use client";

import { useTabStore } from '@/store/useTabStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useNetworkStore } from '@/store/useNetworkStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

function IframeWrapper({ url, isActive, tabId }: { url: string; isActive: boolean, tabId: string }) {
  const [loading, setLoading] = useState(true);
  const updateTabUrl = useTabStore(state => state.updateTabUrl);
  const addLog = useNetworkStore(state => state.addLog);
  const { activeProfileId } = useProfileStore();

  useEffect(() => {
    setLoading(true);
  }, [url]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Avoid cross-talk between inactive components tracking global messages
      if (!isActive) return;

      const data = event.data;
      if (data?.type === 'VIBE_NAVIGATE' && data?.payload) {
        updateTabUrl(tabId, data.payload);
      }
      if (data?.type === 'VIBE_NETWORK_LOG' && data?.payload) {
        addLog(data.payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isActive, tabId, updateTabUrl, addLog]);

  // Determine if it's an internal Next.js route or an external website
  const frameSrc = url.startsWith('/') 
    ? url 
    : `/api/proxy?url=${encodeURIComponent(url)}&profileId=${encodeURIComponent(activeProfileId)}`;

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
        src={frameSrc}
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
          tabId={tab.id}
          url={tab.url} 
          isActive={tab.id === activeTabId} 
        />
      ))}
    </div>
  );
}
