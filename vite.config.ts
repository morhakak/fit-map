import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: isDev
    ? {
        proxy: {
          "/api": {
            target: "https://data.gov.il",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ""),
          },
          "/osm-reverse": {
            target: "https://nominatim.openstreetmap.org",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/osm-reverse/, ""),
          },
        },
      }
    : undefined,
});
