"use client";

import { BookmarkIcon, HistoryIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";

export function Sidebar() {
  const router = useRouter();
  const { toggleSidebarPanel, activeSidebarPanel } = useUIStore();

  return (
    <div className="w-14 h-full border-r bg-background/50 backdrop-blur-md flex flex-col items-center py-4 space-y-4 shadow-[1px_0_10px_rgba(0,0,0,0.1)] z-10 block shrink-0">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => toggleSidebarPanel('bookmarks')}
        className={`w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${activeSidebarPanel === 'bookmarks' ? 'bg-black/5 dark:bg-white/5 text-primary' : 'text-muted-foreground'}`}
      >
        <BookmarkIcon className="w-5 h-5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => toggleSidebarPanel('history')}
        className={`w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${activeSidebarPanel === 'history' ? 'bg-black/5 dark:bg-white/5 text-primary' : 'text-muted-foreground'}`}
      >
        <HistoryIcon className="w-5 h-5" />
      </Button>
      <div className="flex-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => router.push('/settings')}
        className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
      >
        <SettingsIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
