import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GraphState {
    user: number[];
    announcer: number[];
    setUser: (userData: number[]) => void;
    setAnnouncer: (announcerData: number[]) => void;
}

const useGraphStore = create<GraphState>()(
    devtools((set) => ({
        user: [],
        announcer: [],
        setUser: (userData) => set({ user: userData }),
        setAnnouncer: (announcerData) => set({ announcer: announcerData }),
    }))
);

export default useGraphStore;
