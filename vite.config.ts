import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  define: {
    global: {}, // để SockJS không bị lỗi
  },
  // server: {
  //   proxy: {
  //     "/ws": {
  //       target: "http://localhost:8080", // ✅ backend port
  //       changeOrigin: true,
  //       ws: true, // ⚠️ phải có dòng này cho WebSocket hoạt động
  //     },
  //   },
  // },
});
