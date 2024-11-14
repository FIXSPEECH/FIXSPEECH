import {create} from 'zustand';
import {devtools} from 'zustand/middleware';

interface ArrowState {
    isNext : boolean;
    setIsNext: (isNext: boolean) => void;
}


const useNextArrowState = create<ArrowState> () (
    devtools((set) => ({
        isNext: false,
        setIsNext: (isNext) => set({isNext})
    }))
)

export default useNextArrowState;