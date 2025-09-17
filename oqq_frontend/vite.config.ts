import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // <-- Pour Windows et Mac, ce chemin fonctionne dans 99% des cas.
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
