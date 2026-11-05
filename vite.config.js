import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(vue|vue-router|@vue)\//.test(id)) return "vue-vendor";
          if (/node_modules\/(element-plus|@element-plus)\//.test(id)) return "element-vendor";
          if (/node_modules\/(axios|@supabase|nanoid|vue-cookies)\//.test(id)) return "data-vendor";
          if (/node_modules\/(lottie-web|vue3-lottie|@lottiefiles)\//.test(id)) return "lottie-vendor";
        },
      },
    },
  },
});
