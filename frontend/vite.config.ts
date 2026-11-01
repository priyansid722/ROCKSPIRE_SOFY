import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // "@/components/Button" resolves to "src/components/Button"
      // Uses import.meta.url instead of __dirname (compatible with native config loader)
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
