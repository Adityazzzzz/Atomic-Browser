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
    
    addLog: (log: Omit<NetworkLog, 'id' | 'timestamp'>) => void;
    clearLogs: () => void;
    toggleDevTools: () => void;
    setDevToolsOpen: (state: boolean) => void;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
    logs: [],
    isOpen: false,

    addLog: (log) => set((state) => {
        const newLog: NetworkLog = { 
            ...log, 
            id: Math.random().toString(36).substring(7), 
            timestamp: Date.now() 
        };
        // Keep logs cleanly optimized at max 200 entries to prevent DOM lag
        return { logs: [newLog, ...state.logs].slice(0, 200) };
    }),

    clearLogs: () => set({ logs: [] }),
    toggleDevTools: () => set((state) => ({ isOpen: !state.isOpen })),
    setDevToolsOpen: (isOpen) => set({ isOpen }),
}));
