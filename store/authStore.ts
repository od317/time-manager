import { create } from "zustand";
import { User, UserSettings } from "@/types";
import { authService } from "@/lib/services";

interface AuthState {
  user: (User & { settings?: UserSettings }) | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isUserLoading: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  return document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1] || null;
}

function setAuthCookie(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function removeAuthCookie() {
  document.cookie = "token=; path=/; max-age=0";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  isUserLoading: false,

  initialize: async () => {
    // Prevent duplicate calls
    if (get().isInitialized) return;

    const token = getToken();

    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        isUserLoading: false,
      });
      return;
    }

    // Only fetch if we don't already have the user
    if (get().user) {
      set({ isInitialized: true, isUserLoading: false });
      return;
    }

    set({
      isAuthenticated: true,
      isInitialized: true,
      isUserLoading: true,
    });

    try {
      const user = await authService.getMe();
      set({ user, isUserLoading: false });
    } catch {
      removeAuthCookie();
      set({
        user: null,
        isAuthenticated: false,
        isUserLoading: false,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
      setAuthCookie(response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true });
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    try {
      const response = await authService.register({
        email,
        password,
        name,
        timezone,
      });
      setAuthCookie(response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore
    }
    removeAuthCookie();
    set({
      user: null,
      isAuthenticated: false,
      isUserLoading: false,
    });
    window.location.href = "/login";
  },
}));
