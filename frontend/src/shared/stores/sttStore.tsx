import {create} from 'zustand';
import {devtools} from 'zustand/middleware';

interface SttState {
    userStt : string,
    setUserStt: (userStt: string) => void;
}


const useSttStore = create<SttState>() (
    devtools((set) => ({
        userStt : '',
        setUserStt: (userStt) => set({userStt})
    }))
)


export default useSttStore;