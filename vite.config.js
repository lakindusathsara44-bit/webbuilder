import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",
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
