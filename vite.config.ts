import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Split three.js out of the model-viewer chunk.
         *
         * The gain is cache stability, not bytes: three is ~690 kB that changes
         * only when the dependency is bumped, so a content-only deploy no longer
         * invalidates it. Total transfer on the model path is unchanged, and the
         * landing page still downloads neither (verified: `/` fetches only the
         * entry chunk and the stylesheet).
         *
         * Do NOT also group `@react-three/*` and `maath` into a chunk here. That
         * was measured: it makes three AND the r3f chunk eager on the landing
         * page — ~310 kB gzip that used to load only when a project file opened
         * a model. Anything reachable from a lazy route must stay where Vite's
         * automatic chunking puts it.
         */
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) return 'three';
          return undefined;
        },
      },
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces (allows mobile device access)
    port: Number(process.env.PORT) || 5173, // honor harness-assigned port (autoPort), fall back to 5173
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
