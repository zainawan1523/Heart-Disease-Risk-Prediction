import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: { outDir: '../static', emptyOutDir: true },
  server: { proxy: { '/predict': 'http://localhost:5000', '/info': 'http://localhost:5000' } }
})