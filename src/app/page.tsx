"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarPanel } from "@/components/layout/SidebarPanel";
import { Topbar } from "@/components/layout/Topbar";
import { TabContent } from "@/components/browser/TabContent";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center text-muted-foreground animate-pulse">
        Initializing VibeBrowser Core...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30 relative">
      <Sidebar />
      <SidebarPanel />
      
      <div className="flex flex-col flex-1 w-full h-full overflow-hidden relative">
        <Topbar />
        <TabContent />
      </div>
    </div>
  );
}
