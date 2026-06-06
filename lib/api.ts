import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  token?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ============================================================================
// REQUEST DEDUPLICATION & RACE CONDITION HANDLER
// ============================================================================

class RequestRegistry {
  private pendingRequests = new Map<string, AbortController>();

  register(key: string): AbortController {
    this.cancel(key);
    const controller = new AbortController();
    this.pendingRequests.set(key, controller);
    return controller;
  }

  cancel(key: string): void {
    const controller = this.pendingRequests.get(key);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(key);
    }
  }

  complete(key: string): void {
    this.pendingRequests.delete(key);
  }

  cancelAll(): void {
    this.pendingRequests.forEach((controller) => controller.abort());
    this.pendingRequests.clear();
  }

  isPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

interface ServerErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiErrorHandler {
  static parse(error: AxiosError<ServerErrorResponse>): ApiError {
    // Cancelled request
    if (axios.isCancel(error)) {
      return {
        message: "Request cancelled",
        code: "CANCELLED",
        status: 0,
      };
    }

    // Network error (no response)
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return {
          message:
            "Request timed out. Please check your connection and try again.",
          code: "TIMEOUT",
          status: 408,
        };
      }
      if (error.message === "Network Error") {
        return {
          message:
            "Unable to connect to the server. Please check your internet connection.",
          code: "NETWORK_ERROR",
          status: 0,
        };
      }
      return {
        message: "An unexpected network error occurred.",
        code: "NETWORK_ERROR",
        status: 0,
      };
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        return {
          message: data?.message || "Invalid request. Please check your input.",
          code: "BAD_REQUEST",
          status: 400,
          errors: data?.errors,
        };
      case 401:
        return {
          message: "Session expired. Please log in again.",
          code: "UNAUTHORIZED",
          status: 401,
        };
      case 403:
        return {
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
          status: 403,
        };
      case 404:
        return {
          message: data?.message || "The requested resource was not found.",
          code: "NOT_FOUND",
          status: 404,
        };
      case 409:
        return {
          message:
            data?.message ||
            "This operation conflicts with an existing record.",
          code: "CONFLICT",
          status: 409,
        };
      case 422:
        return {
          message:
            data?.message || "Validation failed. Please check your input.",
          code: "VALIDATION_ERROR",
          status: 422,
          errors: data?.errors,
        };
      case 429:
        return {
          message: "Too many requests. Please wait a moment and try again.",
          code: "RATE_LIMITED",
          status: 429,
        };
      case 500:
        return {
          message: "Server error. Please try again later.",
          code: "SERVER_ERROR",
          status: 500,
        };
      default:
        return {
          message: data?.message || "Something went wrong. Please try again.",
          code: "UNKNOWN",
          status,
        };
    }
  }
}

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const DEFAULT_TIMEOUT = 15000;

const axiosInstance: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://time-manager-api-3r7i.onrender.com/api",
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

function getTokenFromCookie(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

// Request interceptor - attach token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getTokenFromCookie();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear the cookie
        document.cookie = "token=; path=/; max-age=0";
        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// ============================================================================
// API CLIENT CLASS
// ============================================================================

interface RequestOptions<TParams = Record<string, unknown>, TData = unknown> {
  data?: TData;
  params?: TParams;
  timeout?: number;
  cancelKey?: string;
  cancelPrevious?: boolean;
}

class ApiClient {
  private registry = new RequestRegistry();
  private axios: AxiosInstance;

  constructor() {
    this.axios = axiosInstance;
  }

  private getRequestKey(method: string, url: string, params?: unknown): string {
    return `${method}:${url}:${params ? JSON.stringify(params) : ""}`;
  }

  private async request<
    TResponse,
    TParams = Record<string, unknown>,
    TData = unknown,
  >(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    options?: RequestOptions<TParams, TData>,
  ): Promise<TResponse> {
    const requestKey =
      options?.cancelKey || this.getRequestKey(method, url, options?.params);

    const shouldCancel = options?.cancelPrevious !== false;

    let signal: AbortSignal | undefined;
    if (shouldCancel) {
      const controller = this.registry.register(requestKey);
      signal = controller.signal;
    }

    try {
      const response = await this.axios.request<TResponse>({
        method,
        url,
        data: options?.data,
        params: options?.params,
        timeout: options?.timeout || DEFAULT_TIMEOUT,
        signal,
      });

      this.registry.complete(requestKey);
      return response.data;
    } catch (error) {
      this.registry.complete(requestKey);
      throw ApiErrorHandler.parse(error as AxiosError<ServerErrorResponse>);
    }
  }

  cancelAll(): void {
    this.registry.cancelAll();
  }

  cancel(key: string): void {
    this.registry.cancel(key);
  }

  // ==========================================================================
  // HTTP METHOD SHORTCUTS
  // ==========================================================================

  async get<TResponse, TParams = Record<string, unknown>>(
    url: string,
    params?: TParams,
    cancelKey?: string,
  ): Promise<TResponse> {
    return this.request<TResponse, TParams>("GET", url, { params, cancelKey });
  }

  async post<TResponse, TData = unknown>(
    url: string,
    data?: TData,
    cancelKey?: string,
  ): Promise<TResponse> {
    return this.request<TResponse, Record<string, unknown>, TData>(
      "POST",
      url,
      {
        data,
        cancelKey,
        cancelPrevious: true,
      },
    );
  }

  async put<TResponse, TData = unknown>(
    url: string,
    data?: TData,
    cancelKey?: string,
  ): Promise<TResponse> {
    return this.request<TResponse, Record<string, unknown>, TData>("PUT", url, {
      data,
      cancelKey,
      cancelPrevious: true,
    });
  }

  async patch<TResponse, TData = unknown>(
    url: string,
    data?: TData,
    cancelKey?: string,
  ): Promise<TResponse> {
    return this.request<TResponse, Record<string, unknown>, TData>(
      "PATCH",
      url,
      {
        data,
        cancelKey,
        cancelPrevious: true,
      },
    );
  }

  async delete<TResponse>(url: string, cancelKey?: string): Promise<TResponse> {
    return this.request<TResponse>("DELETE", url, {
      cancelKey,
      cancelPrevious: true,
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const api = new ApiClient();

// ============================================================================
// UTILITIES
// ============================================================================

export const createCancelKey = (
  resource: string,
  action: string,
  id?: string,
): string => {
  return [resource, action, id].filter(Boolean).join(":");
};

export const CancelKeys = {
  GOAL_CREATE: "goal:create",
  GOAL_UPDATE: "goal:update",
  GOAL_DELETE: "goal:delete",
  HABIT_CREATE: "habit:create",
  HABIT_LOG: "habit:log",
  HABIT_SKIP: "habit:skip",
  TIMER_START: "timer:start",
  TIMER_STOP: "timer:stop",
  TODAY: "today:get",
} as const;
