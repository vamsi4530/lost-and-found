import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 5173,
    allowedHosts: ['lost-and-found-v2n1.onrender.com']
  },
  build: {
    outDir: 'dist'
  }
});
