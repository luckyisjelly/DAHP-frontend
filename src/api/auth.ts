import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from "@/types/api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/api/auth/login", payload);
  return res.data;
}

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const res = await apiClient.post<SignupResponse>("/api/auth/signup", payload);
  return res.data;
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<User>("/api/users/me");
  return res.data;
}
