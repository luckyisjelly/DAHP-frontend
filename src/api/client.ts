import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/auth";
import type { ApiErrorBody, ApiResponse, LoginResponse } from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8090";

export class ApiError extends Error {
  code: string;
  hint?: string | null;
  status?: number;

  constructor(body: ApiErrorBody, status?: number) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.hint = body.hint;
    this.status = status;
  }
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();
  if (!refreshToken) {
    clear();
    throw new Error("No refresh token");
  }
  try {
    const res = await axios.post<ApiResponse<LoginResponse>>(
      `${BASE_URL}/api/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    const body = res.data;
    if (!body.success || !body.data) {
      throw new Error(body.error?.message ?? "Refresh failed");
    }
    setTokens(body.data.accessToken, body.data.refreshToken);
    useAuthStore.getState().setUser(body.data.user);
    return body.data.accessToken;
  } catch (err) {
    clear();
    throw err;
  }
}

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      if (!body.success) {
        const errBody = body.error ?? {
          code: "UNKNOWN",
          message: body.message ?? "API error",
        };
        return Promise.reject(new ApiError(errBody, response.status));
      }
      // Unwrap `data` so callers get the payload directly.
      return { ...response, data: body.data } as AxiosResponse;
    }
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      const url = original.url ?? "";
      // Don't try to refresh on the refresh/login/signup endpoints themselves.
      const isAuthEndpoint =
        url.includes("/api/auth/refresh") ||
        url.includes("/api/auth/login") ||
        url.includes("/api/auth/signup");
      if (!isAuthEndpoint) {
        original._retry = true;
        try {
          refreshPromise = refreshPromise ?? refreshAccessToken();
          const newToken = await refreshPromise;
          refreshPromise = null;
          original.headers = original.headers ?? {};
          (original.headers as Record<string, string>).Authorization =
            `Bearer ${newToken}`;
          return apiClient(original);
        } catch (refreshErr) {
          refreshPromise = null;
          if (typeof window !== "undefined") {
            const path = window.location.pathname;
            if (!path.startsWith("/login") && !path.startsWith("/signup")) {
              window.location.assign("/login");
            }
          }
          return Promise.reject(refreshErr);
        }
      }
    }

    const body = error.response?.data;
    if (body && typeof body === "object" && "error" in body && body.error) {
      return Promise.reject(new ApiError(body.error, status));
    }
    return Promise.reject(error);
  },
);
