import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GraphState {
    user: number[];
    announcer: number[];
    similarity: number;
    setUser: (userData: number[]) => void;
    setAnnouncer: (announcerData: number[]) => void;
    setSimilarity: (similarity: number) => void;
}

const useGraphStore = create<GraphState>()(
    devtools((set) => ({
        user: [],
        announcer: [],
        similarity: 0,
        setUser: (userData) => set({ user: userData }),
        setAnnouncer: (announcerData) => set({ announcer: announcerData }),
        setSimilarity: (similarity) => set({similarity})
    }))
);

export default useGraphStore;
