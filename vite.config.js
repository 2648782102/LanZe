import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { preloadRouteAssets } from "./scripts/vite-preload-plugin.mjs";

export default defineConfig({
  plugins: [vue(), preloadRouteAssets(process.cwd())],
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: false,
  },
  build: {
    target: "es2020",
    sourcemap: false,
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(vue|vue-router|@vue)\//.test(id)) return "vue-vendor";
        },
      },
    },
  },
});
