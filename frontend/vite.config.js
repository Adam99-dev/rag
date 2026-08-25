import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const USER_API_TARGET = 'http://localhost:3002'
const CHAT_API_TARGET = 'http://localhost:3003'
const UPLOAD_API_TARGET = 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/user-api': {
        target: USER_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/user-api/, ''),
      },
      '/chat-api': {
        target: CHAT_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat-api/, ''),
      },
      '/upload-api': {
        target: UPLOAD_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload-api/, ''),
      },
    },
  },
})
