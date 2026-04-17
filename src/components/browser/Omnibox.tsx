import { useState, useEffect } from 'react';
import { useTabStore } from '@/store/useTabStore';
import { Input } from '@/components/ui/input';
import { Search, Globe } from 'lucide-react';

export function Omnibox() {
  const { tabs, activeTabId, updateTabUrl } = useTabStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [value, setValue] = useState(activeTab?.url || '');

  useEffect(() => {
    if (activeTab) {
      // Don't override if user is typing
      if (document.activeElement !== document.getElementById('omnibox-input')) {
        setValue(activeTab.url);
      }
    }
  }, [activeTab?.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTabId || !value.trim()) return;

    let finalUrl = value.trim();
    // Simple naive check: if there's no space and contains a dot, assume URL. Otherwise, search.
    const isUrl = /^[^\s]+\.[^\s]+$/.test(finalUrl) || finalUrl.startsWith('http://') || finalUrl.startsWith('https://') || finalUrl.startsWith('localhost:');
    
    if (isUrl) {
      if (!finalUrl.startsWith('http')) {
        finalUrl = `https://${finalUrl}`;
      }
    } else {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
    }

    updateTabUrl(activeTabId, finalUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl px-4 relative">
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 text-muted-foreground">
          {value.startsWith('http') || /^[^\s]+\.[^\s]+$/.test(value) ? (
            <Globe className="w-4 h-4" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <Input
          id="omnibox-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search Google or type a URL"
          className="w-full pl-9 bg-background/50 backdrop-blur-sm border-white/10 dark:border-white/5 focus-visible:ring-1 focus-visible:ring-primary h-9 rounded-full shadow-inner"
        />
      </div>
    </form>
  );
}
