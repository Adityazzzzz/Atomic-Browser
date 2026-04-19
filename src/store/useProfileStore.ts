import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface VibeProfile {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
}

interface ProfileStore {
    profiles: VibeProfile[];
    activeProfileId: string;
    
    addProfile: (name: string, email: string) => void;
    setActiveProfile: (id: string) => void;
    removeProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileStore>()(
    persist(
        (set) => ({
            profiles: [
                { id: 'default', name: 'Default Profile', email: 'guest@vibe.local', avatarColor: 'bg-indigo-500' }
            ],
            activeProfileId: 'default',
            
            addProfile: (name, email) => set((state) => {
                const colors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500'];
                const newProfile: VibeProfile = {
                    id: Math.random().toString(36).substring(7),
                    name,
                    email,
                    avatarColor: colors[Math.floor(Math.random() * colors.length)]
                };
                return { profiles: [...state.profiles, newProfile], activeProfileId: newProfile.id };
            }),

            setActiveProfile: (id) => set({ activeProfileId: id }),

            removeProfile: (id) => set((state) => {
                const updatedList = state.profiles.filter(p => p.id !== id);
                if (updatedList.length === 0) return state; // Prevent deleting last active profile
                return { 
                    profiles: updatedList, 
                    activeProfileId: state.activeProfileId === id ? updatedList[0].id : state.activeProfileId 
                };
            })
        }),
        {
            name: 'vibe-profile-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
