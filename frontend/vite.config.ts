import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [react()],
  envDir: '..',
  resolve: {
    alias: {
      '@lexclarity/shared/constants': fileURLToPath(
        new URL('../shared/src/constants.ts', import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8787', '/health': 'http://localhost:8787' },
  },
});
