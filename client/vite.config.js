import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      },
      // Proxy Socket.IO connections
      '/socket.io': {
        target: 'http://localhost:3500', // Your backend server URL
        ws: true, // Enable WebSocket proxying
        changeOrigin: true,
      },
    },
  },
})
