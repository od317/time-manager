import { api } from "@/lib/api";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  UserSettings,
} from "@/types";

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse, RegisterPayload>(
      "/auth/register",
      data,
      "auth:register",
    ),

  login: (data: LoginPayload) =>
    api.post<AuthResponse, LoginPayload>("/auth/login", data, "auth:login"),

  getMe: () => api.get<User & { settings: UserSettings }>("/auth/me"),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    api.cancelAll();
  },
};
