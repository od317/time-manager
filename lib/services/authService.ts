import { api } from "@/lib/api";
import { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types";

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse, RegisterPayload>(
      "/auth/register",
      data,
      "auth:register",
    ),

  login: (data: LoginPayload) =>
    api.post<AuthResponse, LoginPayload>("/auth/login", data, "auth:login"),

  getMe: () => api.get<User>("/auth/me"),

  logout: () => api.post<void>("/auth/logout"),

  verifyEmail: (token: string) =>
    api.post<{ message: string }>("/auth/verify-email", { token }),

  resendVerification: (email: string) =>
    api.post<{ message: string }>("/auth/resend-verification", { email }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, password }),

  updateProfile: (data: { name?: string }) =>
    api.put<User>("/auth/profile", data),

  updateSettings: (data: any) => api.put<any>("/auth/settings", data),
};
