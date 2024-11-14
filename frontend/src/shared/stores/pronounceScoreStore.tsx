import {create} from 'zustand';
import { devtools } from 'zustand/middleware';


interface PronounceScoreState {
    isNumber : number;  // 총 문제의 개수
    isCorrect : number;  // 맞춘 문제의 개수
    setIsNumber: () => void
    setIsCorrect: () => void
    setIsNumberZero: () => void;
    setIsNumberMinus: () => void;
 }

const usePronounceScoreStore = create<PronounceScoreState>() (
    devtools((set) => ({
        isNumber: 0,
        isCorrect: 0,
        setIsNumber: () => set((state) => ({isNumber: state.isNumber + 1})),
        setIsNumberMinus:  () => set((state) => ({isNumber: state.isNumber - 1})),
        setIsCorrect: () => set((state) =>({isCorrect: state.isCorrect + 1}) ),
        setIsNumberZero: () => set(() => ({ isNumber: 0 })),
})))

export default usePronounceScoreStore;