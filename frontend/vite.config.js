import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  define: {
    'process.env.VITE_API_URL': mode === 'production' 
      ? JSON.stringify('https://tu-backend-url.com/api')
      : JSON.stringify('http://localhost:3000/api')
  }
}))
