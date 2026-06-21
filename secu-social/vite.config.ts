import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
      '/assures': 'http://localhost:8080',
      '/medecins': 'http://localhost:8080',
      '/consultations': 'http://localhost:8080',
      '/feuilles': 'http://localhost:8080',
      '/prescriptions': 'http://localhost:8080',
      '/remboursements': 'http://localhost:8080',
    },
  },
})
