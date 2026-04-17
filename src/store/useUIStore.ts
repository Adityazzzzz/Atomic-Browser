import { create } from 'zustand';

interface UIStore {
  activeSidebarPanel: 'history' | 'bookmarks' | null;
  toggleSidebarPanel: (panel: 'history' | 'bookmarks') => void;
  closeSidebarPanel: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeSidebarPanel: null,
  
  toggleSidebarPanel: (panel) => set((state) => ({ 
    activeSidebarPanel: state.activeSidebarPanel === panel ? null : panel 
  })),
  
  closeSidebarPanel: () => set({ activeSidebarPanel: null }),
}));
