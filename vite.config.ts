import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // VitePWA disabled for AI Studio environment stability
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // This app runs Vite through an Express middleware server, so HMR is disabled.
      // The middleware stack serves the app without a separate websocket client.
      hmr: false,
    },
  };
});
