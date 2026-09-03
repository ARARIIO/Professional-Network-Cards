import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
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
