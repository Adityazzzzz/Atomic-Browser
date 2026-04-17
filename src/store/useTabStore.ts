import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon: string;
  historyStack: string[];
  currentIndex: number;
}

export interface GlobalHistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export interface BookmarkItem {
  id: string;
  url: string;
  title: string;
  favicon: string;
}

interface TabStore {
  // Tabs State
  tabs: Tab[];
  activeTabId: string | null;
  // Ecosystem State
  globalHistory: GlobalHistoryItem[];
  bookmarks: BookmarkItem[];
  
  // Actions
  addTab: (url?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabUrl: (id: string, url: string) => void;
  navigateBack: (id: string) => void;
  navigateForward: (id: string) => void;

  // Ecosystem Actions
  addGlobalHistory: (url: string, title?: string) => void;
  clearGlobalHistory: () => void;
  addBookmark: (url: string, title: string, favicon?: string) => void;
  removeBookmark: (url: string) => void;
}

const createNewTab = (url: string = 'https://example.com', idOverride?: string): Tab => ({
  id: idOverride || Math.random().toString(36).substring(2, 9),
  url,
  title: 'New Tab',
  favicon: '',
  historyStack: [url],
  currentIndex: 0,
});

export const useTabStore = create<TabStore>()(
  persist(
    (set) => ({
      tabs: [createNewTab('https://example.com', 'default-tab-1')],
      activeTabId: 'default-tab-1',
      globalHistory: [],
      bookmarks: [],

      addTab: (url) => set((state) => {
        const newTab = createNewTab(url);
        return {
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        };
      }),

      closeTab: (id) => set((state) => {
        const newTabs = state.tabs.filter(t => t.id !== id);
        if (newTabs.length === 0) {
          const fallbackTab = createNewTab();
          return { tabs: [fallbackTab], activeTabId: fallbackTab.id };
        }
        let newActiveId = state.activeTabId;
        if (state.activeTabId === id) {
          newActiveId = newTabs[newTabs.length - 1].id;
        }
        return { tabs: newTabs, activeTabId: newActiveId };
      }),

      setActiveTab: (id) => set({ activeTabId: id }),

      updateTabUrl: (id, url) => set((state) => {
        const hostname = getHostnameSafely(url);
        const newGlobalHistory = [...state.globalHistory];
        
        // Push unique active navigations to global ecosystem (exclude duplicate sequential)
        if (newGlobalHistory.length === 0 || newGlobalHistory[0].url !== url) {
            newGlobalHistory.unshift({
                id: Math.random().toString(36).substring(2, 9),
                url,
                title: hostname,
                timestamp: Date.now()
            });
            if (newGlobalHistory.length > 500) newGlobalHistory.pop();
        }

        return {
          globalHistory: newGlobalHistory,
          tabs: state.tabs.map(tab => {
            if (tab.id === id) {
              const newHistoryStack = [
                ...tab.historyStack.slice(0, tab.currentIndex + 1),
                url
              ];
              return {
                ...tab,
                url,
                title: hostname,
                historyStack: newHistoryStack,
                currentIndex: newHistoryStack.length - 1
              };
            }
            return tab;
          })
        };
      }),

      navigateBack: (id) => set((state) => ({
        tabs: state.tabs.map(tab => {
          if (tab.id === id && tab.currentIndex > 0) {
            const newIndex = tab.currentIndex - 1;
            return {
              ...tab,
              currentIndex: newIndex,
              url: tab.historyStack[newIndex]
            };
          }
          return tab;
        })
      })),

      navigateForward: (id) => set((state) => ({
        tabs: state.tabs.map(tab => {
          if (tab.id === id && tab.currentIndex < tab.historyStack.length - 1) {
            const newIndex = tab.currentIndex + 1;
            return {
              ...tab,
              currentIndex: newIndex,
              url: tab.historyStack[newIndex]
            };
          }
          return tab;
        })
      })),

      addGlobalHistory: (url, title = 'Visited Site') => set((state) => {
         const entry = { id: Math.random().toString(36).substring(7), url, title, timestamp: Date.now() };
         return { globalHistory: [entry, ...state.globalHistory].slice(0, 500) };
      }),
      
      clearGlobalHistory: () => set({ globalHistory: [] }),

      addBookmark: (url, title, favicon = '') => set((state) => {
         if (state.bookmarks.find(b => b.url === url)) return state;
         return { 
           bookmarks: [...state.bookmarks, { id: Math.random().toString(36).substring(7), url, title, favicon }] 
         };
      }),

      removeBookmark: (url) => set((state) => ({
         bookmarks: state.bookmarks.filter(b => b.url !== url)
      }))
    }),
    {
      name: 'vibe-browser-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

function getHostnameSafely(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch (e) {
    if (url.startsWith('/search')) return 'Search';
    return url;
  }
}
