import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? "/webbuilder/" : "/"),
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        notepad: resolve(process.cwd(), "notepad/index.html"),
        htmlEditor: resolve(process.cwd(), "html-editor/index.html")
      }
    }
  }
});
