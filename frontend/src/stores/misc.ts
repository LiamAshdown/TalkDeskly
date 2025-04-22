import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MiscState {
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useMiscStore = create<MiscState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarCollapsed: false,
      setTheme: (theme) => {
        document.documentElement.classList.add("theme-transitioning");

        document.documentElement.classList.toggle("dark", theme === "dark");

        setTimeout(() => {
          document.documentElement.classList.remove("theme-transitioning");
        }, 300);

        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === "dark" ? "light" : "dark";

          document.documentElement.classList.add("theme-transitioning");

          document.documentElement.classList.toggle(
            "dark",
            newTheme === "dark"
          );

          setTimeout(() => {
            document.documentElement.classList.remove("theme-transitioning");
          }, 300);

          return { theme: newTheme };
        }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "ui-preferences",
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (rehydratedState && !error) {
            document.documentElement.classList.toggle(
              "dark",
              rehydratedState.theme === "dark"
            );
          }
        };
      },
    }
  )
);
