import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  build: {
    lib: {
      entry: "app/sdk.tsx", // Entry point that exposes window.talkDeskly
      name: "talkDeskly",
      fileName: "talkdeskly-sdk",
      formats: ["umd"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    target: "es2015",
  },
});
