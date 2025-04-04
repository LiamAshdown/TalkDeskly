import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "@/lib/api/services/auth";

interface AuthState {
  user: AuthResponse["user"] | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (auth: AuthResponse | null) =>
        set({ user: auth?.user, token: auth?.token, isAuthenticated: !!auth }),
      setToken: (token: string | null) => set({ token }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
