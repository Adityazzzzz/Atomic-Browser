import { create } from 'zustand';

export interface NetworkLog {
    id: string;
    url: string;
    method: string;
    status?: number;
    latencyMs?: number;
    timestamp: number;
    type: 'PROXY' | 'XHR' | 'FETCH' | 'SYSTEM';
}

interface NetworkStore {
    logs: NetworkLog[];
    isOpen: boolean;
    recentToasts: NetworkLog[];
    
    addLog: (log: Omit<NetworkLog, 'id' | 'timestamp'>) => void;
    removeToast: (id: string) => void;
    clearLogs: () => void;
    toggleDevTools: () => void;
    setDevToolsOpen: (state: boolean) => void;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
    logs: [],
    isOpen: false,
    recentToasts: [],

    addLog: (log) => set((state) => {
        const newLog: NetworkLog = { 
            ...log, 
            id: Math.random().toString(36).substring(7), 
            timestamp: Date.now() 
        };
        
        // Only push critical payload events to the visual Toast queue, preventing deep asset floods (css/fonts)
        const isCritical = ['PROXY', 'XHR', 'FETCH', 'SYSTEM', 'NAVIGATION', 'DOC'].includes(newLog.type);
        const nextToasts = isCritical ? [newLog, ...state.recentToasts].slice(0, 5) : state.recentToasts;

        return { 
            logs: [newLog, ...state.logs].slice(0, 200),
            recentToasts: nextToasts
        };
    }),

    removeToast: (id) => set((state) => ({
        recentToasts: state.recentToasts.filter(t => t.id !== id)
    })),

    clearLogs: () => set({ logs: [] }),
    toggleDevTools: () => set((state) => ({ isOpen: !state.isOpen })),
    setDevToolsOpen: (isOpen) => set({ isOpen }),
}));
