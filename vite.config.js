import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        privacy: resolve(import.meta.dirname, "politica-de-privacidade.html"),
        terms: resolve(import.meta.dirname, "termos-de-uso.html")
      }
    }
  }
});

