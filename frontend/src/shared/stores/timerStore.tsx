import {create} from 'zustand'
import {devtools} from 'zustand/middleware'

interface TimerState {
    resetTimer: boolean;   // 타이머 재시작 여부
    setResetTimer: (isTimer: boolean) => void;
}


const useTimerStore = create<TimerState>() (
    devtools((set) => ({
        resetTimer: false,   // 처음에는 재시작 안함
        setResetTimer: (resetTimer) => set({resetTimer})
    }))
);


export default useTimerStore;