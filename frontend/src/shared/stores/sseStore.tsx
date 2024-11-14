import { create } from "zustand";

type AlertType = "success" | "error";

interface SSEState {
  isSSEActive: boolean;
  message: string | null;
  type: AlertType | null;
  startSSE: () => void;
  stopSSE: () => void;
  setAlert: (message: string, type: AlertType) => void;
  clearAlert: () => void;
}

export const useSSEStore = create<SSEState>((set) => ({
  isSSEActive: false,
  message: null,
  type: null,
  startSSE: () => set({ isSSEActive: true }),
  stopSSE: () => set({ isSSEActive: false }),
  setAlert: (message, type) => set({ message, type }),
  clearAlert: () => set({ message: null, type: null }),
}));
