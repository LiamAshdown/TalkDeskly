import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "@/lib/api/services/auth";

interface AuthState {
  user: AuthResponse["user"] | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse | null) => void;
  updateUser: (user: AuthResponse["user"]) => void;
  setToken: (token: string | null) => void;
  isAdmin: () => boolean;
  hasRole: (role: string | string[]) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (auth: AuthResponse | null) =>
        set({ user: auth?.user, token: auth?.token, isAuthenticated: !!auth }),
      updateUser: (user: AuthResponse["user"]) =>
        set({
          user: {
            ...get().user,
            ...user,
          },
        }),
      setToken: (token: string | null) => set({ token }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      isAdmin: () => {
        return get().user?.role === "admin";
      },
      hasRole: (role: string | string[]) => {
        const roles = Array.isArray(role) ? role : [role];
        return roles.some((r) => get().user?.role === r);
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
