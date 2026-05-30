import { create } from "zustand";

type LayoutMode = "single" | "double";
type SectionOrder = string[];

interface UIState {
  isSidebarOpen: boolean;
  layoutMode: LayoutMode;
  sectionOrder: SectionOrder;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setSectionOrder: (order: SectionOrder) => void;
}

// Load saved layout from localStorage
function loadLayoutPrefs(): {
  layoutMode: LayoutMode;
  sectionOrder: SectionOrder;
} {
  if (typeof window === "undefined")
    return { layoutMode: "single", sectionOrder: ["habits", "tasks", "goals"] };

  try {
    const saved = localStorage.getItem("dashboard-layout");
    if (saved) return JSON.parse(saved);
  } catch {}

  return { layoutMode: "single", sectionOrder: ["habits", "tasks", "goals"] };
}

const savedPrefs = loadLayoutPrefs();

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  layoutMode: savedPrefs.layoutMode,
  sectionOrder: savedPrefs.sectionOrder,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  setLayoutMode: (mode) => {
    set({ layoutMode: mode });
    const current = useUIStore.getState();
    localStorage.setItem(
      "dashboard-layout",
      JSON.stringify({
        layoutMode: mode,
        sectionOrder: current.sectionOrder,
      }),
    );
  },

  setSectionOrder: (order) => {
    set({ sectionOrder: order });
    const current = useUIStore.getState();
    localStorage.setItem(
      "dashboard-layout",
      JSON.stringify({
        layoutMode: current.layoutMode,
        sectionOrder: order,
      }),
    );
  },
}));
