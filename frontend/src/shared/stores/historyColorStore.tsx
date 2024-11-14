import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ColorSchemeType } from "../constants/colorSchemes";

interface HistoryColorState {
  selectedColor: ColorSchemeType;
  setSelectedColor: (color: ColorSchemeType) => void;
}

const useHistoryColorStore = create<HistoryColorState>()(
  persist(
    (set) => ({
      selectedColor: "green",
      setSelectedColor: (color) => set({ selectedColor: color }),
    }),
    {
      name: "history-color-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useHistoryColorStore;
