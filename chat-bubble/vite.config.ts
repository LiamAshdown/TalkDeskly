import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import prefixwrap from "postcss-prefixwrap";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths(), cssInjectedByJsPlugin()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": JSON.stringify({}),
  },
  css: {
    postcss: {
      plugins: [
        prefixwrap("#talkdeskly-root", {
          // Don't prefix these selectors as they need to work globally
          ignoredSelectors: [/^html/, /^body/, /^\*/, /:root/, /^@/],
        }),
      ],
    },
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
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    target: "es2015",
    emptyOutDir: true,
  },
});
