import { create } from "zustand";

interface UIState {
  chatOpen: boolean;
  activeSessionId: string | null;
  sidebarCollapsed: boolean;
  toggleChat: () => void;
  setActiveSession: (id: string | null) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  chatOpen: false,
  activeSessionId: null,
  sidebarCollapsed: false,
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  setActiveSession: (id) => set({ activeSessionId: id }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
