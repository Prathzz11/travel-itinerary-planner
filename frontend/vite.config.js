import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-3d';
            }
            if (id.includes('axios') || id.includes('dompurify') || id.includes('browser-image-compression') || id.includes('socket.io-client')) {
              return 'vendor-utils';
            }
          }
        }
      }
    }
  }
})
