const API_URL = "https://time-manager-api-3r7i.onrender.com/api";

interface FetchOptions<TParams = Record<string, unknown>> {
  params?: TParams;
  revalidate?: number | false;
  tags?: string[];
  body?: unknown;
}

class ServerApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // Not a Server Component
    }
    return headers;
  }

  private async request<TResponse, TParams = Record<string, unknown>>(
    method: string,
    path: string,
    options?: FetchOptions<TParams>,
  ): Promise<TResponse> {
    const { params, revalidate, tags, body } = options || {};
    const url = this.buildUrl(path, params as Record<string, unknown>);
    const authHeaders = await this.getAuthHeaders();

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: body ? JSON.stringify(body) : undefined,
      next: {
        ...(revalidate !== undefined && { revalidate }),
        ...(tags && { tags }),
      },
      ...(revalidate === false && { cache: "no-store" as RequestCache }),
    });

    if (response.status === 204) return undefined as TResponse;

    const data = await response.json();

    if (!response.ok) {
      throw {
        message:
          data.message || `Request failed with status ${response.status}`,
        status: response.status,
        errors: data.errors,
      };
    }

    return data;
  }

  async get<TResponse, TParams = Record<string, unknown>>(
    path: string,
    options?: Omit<FetchOptions<TParams>, "body">,
  ): Promise<TResponse> {
    return this.request<TResponse, TParams>("GET", path, options);
  }

  async post<TResponse, TParams = Record<string, unknown>>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions<TParams>, "body">,
  ): Promise<TResponse> {
    return this.request<TResponse, TParams>("POST", path, { ...options, body });
  }

  async put<TResponse, TParams = Record<string, unknown>>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions<TParams>, "body">,
  ): Promise<TResponse> {
    return this.request<TResponse, TParams>("PUT", path, { ...options, body });
  }

  async delete<TResponse, TParams = Record<string, unknown>>(
    path: string,
    options?: Omit<FetchOptions<TParams>, "body">,
  ): Promise<TResponse> {
    return this.request<TResponse, TParams>("DELETE", path, options);
  }
}

export const serverApi = new ServerApiClient();
