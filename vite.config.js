import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: mode === 'development' ? {
    proxy: {
      '/api': {
        target: 'https://hotel-booking-api-p8if.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  } : {},
  build: {
    rollupOptions: {
      external: ['@fortawesome/react-fontawesome'],
    },
  },
  base: './' 
}));