import { useEffect } from "react";
import { useConfig } from "~/stores/config-context";
import { hexToHsl } from "~/lib/utils/color";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { config } = useConfig();

  useEffect(() => {
    if (config.primaryColor) {
      const hslColor = hexToHsl(config.primaryColor);

      const [h, s, l] = hslColor.split(" ");
      const lightness = parseInt(l.replace("%", ""));
      const darkerLightness = Math.max(0, lightness - 10);
      const hoverColor = `${h} ${s} ${darkerLightness}%`;

      // Set CSS custom properties
      document.documentElement.style.setProperty(
        "--primary",
        `hsl(${hslColor})`
      );
      document.documentElement.style.setProperty(
        "--primary-hover",
        `hsl(${hoverColor})`
      );

      const lightnessValue = parseInt(l.replace("%", ""));
      const foregroundColor = lightnessValue > 50 ? "0 0% 0%" : "0 0% 100%";
      document.documentElement.style.setProperty(
        "--primary-foreground",
        `hsl(${foregroundColor})`
      );
    }
  }, [config.primaryColor]);

  return <>{children}</>;
}
