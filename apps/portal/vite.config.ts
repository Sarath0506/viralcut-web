import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/uploads": {
        target: process.env.VITE_API_URL ?? "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
  preview: {
    host: true,
    strictPort: true,
    // Railway (and custom domains) proxy with their own Host header
    allowedHosts: true,
  },
});
