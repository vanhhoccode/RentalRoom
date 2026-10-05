import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7188", // Thay bằng cổng HTTPS thực tế của Backend .NET đang chạy ở Bước 1
        changeOrigin: true,
        secure: false, // Bỏ qua lỗi chứng chỉ SSL tự ký của .NET localhost
      },
    },
  },
});
