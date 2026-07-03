import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Keep CRA's output dir so deploy scripts and CI keep working.
    outDir: 'build',
  },
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    env: {
      VITE_API_ENDPOINT: 'https://api.test.example',
    },
  },
});
