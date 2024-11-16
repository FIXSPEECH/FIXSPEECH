import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ColorSchemeType } from "../constants/colorSchemes";

interface HistoryColorState {
  selectedColor: ColorSchemeType;
  isColorCycling: boolean;
  setSelectedColor: (color: ColorSchemeType) => void;
  toggleColorCycling: () => void;
}

const useHistoryColorStore = create<HistoryColorState>()(
  persist(
    (set) => ({
      selectedColor: "green",
      isColorCycling: false,
      setSelectedColor: (color) => set({ selectedColor: color }),
      toggleColorCycling: () =>
        set((state) => ({ isColorCycling: !state.isColorCycling })),
    }),
    {
      name: "history-color-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useHistoryColorStore;
