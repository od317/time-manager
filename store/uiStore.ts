import { create } from "zustand";

type LayoutMode = "single" | "double";
type SectionOrder = string[];
type Theme = "light" | "dark";

interface UIState {
  isSidebarOpen: boolean;
  layoutMode: LayoutMode;
  sectionOrder: SectionOrder;
  goalOrder: string[];
  theme: Theme;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setSectionOrder: (order: SectionOrder) => void;
  setGoalOrder: (order: string[]) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const cookieTheme = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/)?.[1];
  if (cookieTheme === "dark") return "dark";
  if (cookieTheme === "light") return "light";
  return "light";
}

function loadLayoutPrefs(): {
  layoutMode: LayoutMode;
  sectionOrder: SectionOrder;
  goalOrder: string[];
  theme: Theme;
} {
  if (typeof window === "undefined") {
    return {
      layoutMode: "single",
      sectionOrder: ["habits", "tasks", "goals"],
      goalOrder: [],
      theme: "light",
    };
  }

  try {
    const saved = localStorage.getItem("dashboard-layout");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        layoutMode: parsed.layoutMode || "single",
        sectionOrder: parsed.sectionOrder || ["habits", "tasks", "goals"],
        goalOrder: parsed.goalOrder || [],
        theme: parsed.theme || "light",
      };
    }
  } catch {
    // Invalid JSON, use defaults
  }

  return {
    layoutMode: "single",
    sectionOrder: ["habits", "tasks", "goals"],
    goalOrder: [],
    theme: "light",
  };
}

function saveLayoutPrefs(state: UIState) {
  try {
    localStorage.setItem(
      "dashboard-layout",
      JSON.stringify({
        layoutMode: state.layoutMode,
        sectionOrder: state.sectionOrder,
        goalOrder: state.goalOrder,
        theme: state.theme,
      }),
    );
  } catch {
    // localStorage full or unavailable
  }
}

const savedPrefs = loadLayoutPrefs();

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  layoutMode: savedPrefs.layoutMode,
  sectionOrder: savedPrefs.sectionOrder,
  goalOrder: savedPrefs.goalOrder,
  theme: getInitialTheme() || savedPrefs.theme,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  setLayoutMode: (mode) => {
    set((state) => {
      const newState = { ...state, layoutMode: mode };
      saveLayoutPrefs(newState);
      return { layoutMode: mode };
    });
  },

  setSectionOrder: (order) => {
    set((state) => {
      const newState = { ...state, sectionOrder: order };
      saveLayoutPrefs(newState);
      return { sectionOrder: order };
    });
  },

  setGoalOrder: (order) => {
    set((state) => {
      const newState = { ...state, goalOrder: order };
      saveLayoutPrefs(newState);
      return { goalOrder: order };
    });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme: Theme = state.theme === "light" ? "dark" : "light";
      const newState = { ...state, theme: newTheme };
      saveLayoutPrefs(newState);
      return { theme: newTheme };
    });
  },

  setTheme: (theme) => {
    set((state) => {
      const newState = { ...state, theme };
      saveLayoutPrefs(newState);
      return { theme };
    });
  },
}));
