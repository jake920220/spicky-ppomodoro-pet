import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: false
  },
  preview: {
    port: 1420,
    strictPort: true,
    host: false
  },
  build: {
    target: "es2020",
    sourcemap: false,
    minify: "esbuild"
  }
});
