import { BookmarkIcon, HistoryIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <div className="w-14 h-full border-r bg-background/50 backdrop-blur-md flex flex-col items-center py-4 space-y-4 shadow-[1px_0_10px_rgba(0,0,0,0.1)] z-10 block shrink-0">
      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 dark:hover:bg-white/5">
        <BookmarkIcon className="w-5 h-5 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 dark:hover:bg-white/5">
        <HistoryIcon className="w-5 h-5 text-muted-foreground" />
      </Button>
      <div className="flex-1" />
      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 dark:hover:bg-white/5">
        <SettingsIcon className="w-5 h-5 text-muted-foreground" />
      </Button>
    </div>
  );
}
