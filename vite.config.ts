import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces (allows mobile device access)
    port: 5173,
    strictPort: false,
    // Allow ngrok tunnels and other development hosts
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok.app',
      'localhost',
      '127.0.0.1',
    ],
  },
})
