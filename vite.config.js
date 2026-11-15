import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { preloadRouteAssets } from "./scripts/vite-preload-plugin.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [vue(), preloadRouteAssets(process.cwd(), env.VITE_BASE || "/")],
    // history 路由下资源必须用绝对路径，否则 /poem/xxx 会按目录解析 CSS/JS。
    base: env.VITE_BASE || "/",
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
  };
});
