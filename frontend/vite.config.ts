import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/graphql': { target: 'http://localhost:3000', changeOrigin: true },
      '/auth': { target: 'http://localhost:3000', changeOrigin: true },
      '/cards': { target: 'http://localhost:3000', changeOrigin: true },
      '/storage': { target: 'http://localhost:3000', changeOrigin: true },
      '/contacts': { target: 'http://localhost:3000', changeOrigin: true },
      '/health': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      '/graphql': { target: 'http://localhost:3000', changeOrigin: true },
      '/auth': { target: 'http://localhost:3000', changeOrigin: true },
      '/cards': { target: 'http://localhost:3000', changeOrigin: true },
      '/storage': { target: 'http://localhost:3000', changeOrigin: true },
      '/contacts': { target: 'http://localhost:3000', changeOrigin: true },
      '/health': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom)\//,
              priority: 30,
            },
            {
              name: 'apollo-vendor',
              test: /node_modules[\\/]@apollo\//,
              priority: 20,
            },
            {
              name: 'recharts-vendor',
              test: /node_modules[\\/]recharts\//,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
