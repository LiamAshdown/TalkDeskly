import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": JSON.stringify({}),
  },
  build: {
    lib: {
      entry: "app/sdk.tsx", // Entry point that exposes window.talkDeskly
      name: "talkDeskly",
      fileName: "sdk",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        // Remove globals configuration
      },
    },
    target: "es2015",
  },
});
