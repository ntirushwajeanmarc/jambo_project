import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173, // Default Vite port
    hmr: {
      port: 5173, // Ensure HMR uses the same port
    },
    // Add allowedHosts to fix the blocked request error
    allowedHosts: [
      'b77d-105-178-104-218.ngrok-free.app',
      'localhost',
      '127.0.0.1'
    ],
    cors: {
      origin: [
        'https://b77d-105-178-104-218.ngrok-free.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ],
      credentials: true,
    },
    // Configure headers for ngrok compatibility
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  }
})
