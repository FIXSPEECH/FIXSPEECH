import {create} from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalState {
    isModal: boolean,
    setIsModal: (isModal: boolean) => void
}


const useModalStore = create<ModalState>()(
    devtools((set) => ({
        isModal: false,  // 모달에서 '제출하기'를 누르지 않은 상태
        setIsModal: (isModal) => set({isModal})
    }))
  );

export default useModalStore;