import { create } from 'zustand';

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon: string;
  historyStack: string[];
  currentIndex: number;
}

interface TabStore {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (url?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabUrl: (id: string, url: string) => void;
  navigateBack: (id: string) => void;
  navigateForward: (id: string) => void;
}

const createNewTab = (url: string = 'https://example.com'): Tab => ({
  id: Math.random().toString(36).substring(2, 9),
  url,
  title: 'New Tab',
  favicon: '',
  historyStack: [url],
  currentIndex: 0,
});

export const useTabStore = create<TabStore>((set) => ({
  tabs: [createNewTab()],
  activeTabId: null,

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

  updateTabUrl: (id, url) => set((state) => ({
    tabs: state.tabs.map(tab => {
      if (tab.id === id) {
        const hostname = getHostnameSafely(url);
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
  })),

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
}));

// Set initial active tab
useTabStore.setState((state) => {
  if (state.tabs.length > 0 && !state.activeTabId) {
    return { activeTabId: state.tabs[0].id };
  }
  return state;
});

function getHostnameSafely(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch (e) {
    return url;
  }
}
