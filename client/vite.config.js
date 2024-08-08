import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:3000', // Replace with your backend server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy WebSocket connections to the backend server
      '/ws': {
        target: 'ws://localhost:8080', // Replace with your WebSocket server URL
        ws: true,
      },
    },
  },
})
