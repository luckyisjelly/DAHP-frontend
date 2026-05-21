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

export type UserRole = "USER" | "ADMIN";

export interface UserInfo {
  id: number;
  email: string;
  role: UserRole;
}

export interface User extends UserInfo {
  checkInIntervalDays?: number;
  lastCheckInAt?: string | null;
  nextCheckInDueAt?: string | null;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface SignupRequest {
  email: string;
  password: string;
  checkInIntervalDays: number;
}

export interface SignupResponse {
  userId: number;
  email: string;
  role: UserRole;
  checkInIntervalDays: number;
  nextCheckInDueAt: string;
  nextStep: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}
