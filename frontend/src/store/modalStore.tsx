import {create} from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalState {
    isModal: boolean,
    setIsModal: (isModal: boolean) => void
}


const useModalStore = create<ModalState>()(
    devtools((set) => ({
        isModal: false,
        setIsModal: (isModal) => set({isModal})
    }))
  );

export default useModalStore;