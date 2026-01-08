import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 配置路径别名，@ 指向 src 目录
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // 开发服务器代理配置，解决跨域问题
    proxy: {
      // 将 /api 开头的请求代理到后端服务器
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // 重写路径：去掉 /api 前缀
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
