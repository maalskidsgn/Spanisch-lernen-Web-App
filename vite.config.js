import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Der "proxy" leitet Anfragen an /api an unseren Transkript-Server weiter,
// damit Frontend und Server wie eine App zusammenarbeiten.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
