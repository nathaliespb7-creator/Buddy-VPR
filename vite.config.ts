import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/",
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client/public"),
  build: {
    base: "/",
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "[name]-[hash].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
    },
  },
  plugins: [
    react(),
    // PWA отключён: ошибка write service worker (terser). Включите обратно после обновления vite-plugin-pwa/workbox.
    // VitePWA({ registerType: "autoUpdate", manifest: {...}, workbox: { globPatterns: ["**/*.{js,css,html,ico,png,woff2}"] } }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    host: "0.0.0.0",
    cors: true,
    fs: {
      strict: false,
      allow: [".."],
    },
    hmr: {
      clientPort: 5000,
      host: "localhost",
    },
  },
});
