import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: User | null,
  ) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),
      clear: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "dahp-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const selectIsAuthenticated = (s: AuthState) => Boolean(s.accessToken);
