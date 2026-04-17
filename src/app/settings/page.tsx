"use client";

import { Monitor, Moon, Sun, Search, Shield, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-background text-foreground overflow-y-auto">
      <div className="max-w-4xl mx-auto py-12 px-8">
        
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/40">
          <Button variant="ghost" onClick={() => router.push('/')} className="mr-2 text-muted-foreground">
             &larr; Back to Browser
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
             <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings Hub</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Appearance Section */}
          <div className="flex flex-col gap-6 p-6 rounded-3xl border border-border/20 bg-card/20 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Monitor className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-medium">Appearance</h2>
            </div>
            <p className="text-sm text-muted-foreground -mt-4">Customize how VibeBrowser looks and feels on your device.</p>
            
            <div className="flex items-center gap-4 mt-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                className="flex-1 py-6 rounded-2xl"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                className="flex-1 py-6 rounded-2xl"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          {/* Search Preferences Section */}
          <div className="flex flex-col gap-6 p-6 rounded-3xl border border-border/20 bg-card/20 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-medium">Search Engine</h2>
            </div>
            <p className="text-sm text-muted-foreground -mt-4">Set your default engine for resolving omnibox queries.</p>
            
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/50 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-xs">DDG</div>
                  <span className="font-medium text-sm">Vibe Native (DuckDuckGo Base)</span>
                </div>
                <div className="w-4 h-4 rounded-full border-[4px] border-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-sm">Google Native (Coming Soon)</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="flex flex-col gap-6 p-6 rounded-3xl border border-border/20 bg-card/20 shadow-sm backdrop-blur-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-medium">Privacy & Data Engine</h2>
            </div>
            <p className="text-sm text-muted-foreground -mt-4">Manage how VibeBrowser stores your active states locally.</p>
            
            <div className="flex items-center justify-between p-5 rounded-2xl border border-border/40 bg-background/50">
               <div className="flex flex-col gap-1">
                  <h3 className="font-medium">Wipe Local Storage</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">Permanently deletes all persisted tabs, global history lists, and saved bookmarks from this device.</p>
               </div>
               <Button variant="destructive" onClick={() => { localStorage.clear(); window.location.reload(); }}>
                  Wipe Data
               </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
