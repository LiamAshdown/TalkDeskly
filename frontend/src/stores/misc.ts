import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MiscState {
  theme: "light" | "dark" | "system";
  sidebarCollapsed: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

// Helper function to get resolved theme
const getResolvedTheme = (
  theme: "light" | "dark" | "system"
): "light" | "dark" => {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
};

// Helper function to apply theme to DOM
const applyTheme = (theme: "light" | "dark" | "system") => {
  document.documentElement.classList.add("theme-transitioning");

  const resolvedTheme = getResolvedTheme(theme);
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");

  setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning");
  }, 300);
};

export const useMiscStore = create<MiscState>()(
  persist(
    (set, get) => ({
      theme: "system",
      sidebarCollapsed: false,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === "dark" ? "light" : "dark";
          applyTheme(newTheme);
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
            applyTheme(rehydratedState.theme);

            // Listen for system theme changes when using system theme
            if (rehydratedState.theme === "system") {
              const mediaQuery = window.matchMedia(
                "(prefers-color-scheme: dark)"
              );
              const handleChange = () => {
                const store = useMiscStore.getState();
                if (store.theme === "system") {
                  applyTheme("system");
                }
              };

              mediaQuery.addEventListener("change", handleChange);
              // Store the cleanup function (you might want to handle this in a component)
              window.addEventListener("beforeunload", () => {
                mediaQuery.removeEventListener("change", handleChange);
              });
            }
          }
        };
      },
    }
  )
);
