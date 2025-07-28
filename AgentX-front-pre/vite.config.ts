import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8888', // 你的后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 如果后端/api前缀一致可不变
      },
    },
  },
});
