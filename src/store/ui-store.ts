import { create } from 'zustand';

type ActivePanel = 'character' | 'recap' | 'entities';

interface UIStore {
  sidebarOpen: boolean;
  activePanel: ActivePanel;
  theme: '8bit-green' | '8bit-amber' | 'classic';

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setTheme: (theme: UIStore['theme']) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activePanel: 'character',
  theme: '8bit-green',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  setTheme: (theme) => set({ theme }),
}));
