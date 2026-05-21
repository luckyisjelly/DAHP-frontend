export interface ApiErrorBody {
  code: string;
  message: string;
  hint?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data: T;
  error: ApiErrorBody | null;
  timestamp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface User {
  id: number | string;
  email: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse extends AuthTokens {
  user?: User;
}
