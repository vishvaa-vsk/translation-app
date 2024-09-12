import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'; // Splitting vendor libraries into a separate chunk
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Adjust this limit as per your need
  },
  plugins: [react()],
})

