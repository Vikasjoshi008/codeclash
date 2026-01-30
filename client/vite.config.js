import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  pplugins: [tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // 👈 backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})