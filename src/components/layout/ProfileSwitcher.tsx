"use client";

import { useProfileStore } from "@/store/useProfileStore";
import { Plus, User, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ProfileSwitcher() {
  const { profiles, activeProfileId, setActiveProfile, addProfile } = useProfileStore();
  
  // Hydration safety for Zustand persist
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative outline-none w-10 h-10 rounded-full flex items-center justify-center border-2 border-transparent hover:border-primary/50 transition-all duration-300">
        <div className={`w-8 h-8 rounded-full ${activeProfile.avatarColor} flex items-center justify-center text-white shadow-sm`}>
           <span className="text-xs font-bold uppercase">{activeProfile.name.charAt(0)}</span>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent side="right" align="end" sideOffset={20} className="w-56 bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-2.5">
        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider py-2 px-2">
            Browser Profiles
        </div>
        
        {profiles.map(p => (
            <DropdownMenuItem 
               key={p.id} 
               onClick={() => setActiveProfile(p.id)}
               className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${activeProfileId === p.id ? 'bg-primary/10' : ''}`}
            >
               <div className={`w-7 h-7 rounded-full ${p.avatarColor} flex items-center justify-center text-white shrink-0`}>
                   <span className="text-[10px] font-bold uppercase">{p.name.charAt(0)}</span>
               </div>
               <div className="flex flex-col overflow-hidden">
                   <span className="text-sm font-medium leading-none truncate">{p.name}</span>
                   <span className="text-[10px] text-muted-foreground mt-1 truncate">{p.email}</span>
               </div>
               {activeProfileId === p.id && <Check className="w-4 h-4 ml-auto text-primary" />}
            </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-border/30 my-2" />
        
        <DropdownMenuItem 
           className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-muted/50 text-muted-foreground"
           onClick={() => addProfile(`User ${profiles.length + 1}`, `user${profiles.length + 1}@vibe.local`)}
        >
           <div className="w-7 h-7 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center shrink-0">
               <Plus className="w-4 h-4" />
           </div>
           <span className="text-sm font-medium">Add New Profile</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
