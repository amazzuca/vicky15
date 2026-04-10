import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Utilizamos una ruta base relativa
  base: './',
  server: {
    fs: {
      strict: false,
    }
  }
})
