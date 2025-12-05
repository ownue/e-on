import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  const baseUrl = env.VITE_BASE_URL || 'localhost'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: `http://${baseUrl}:4000`,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '/api'),
        },
      },
    },
  }
})
