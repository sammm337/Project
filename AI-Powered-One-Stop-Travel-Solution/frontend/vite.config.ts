import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';
  const wsTarget = backendTarget.replace(/^http/i, 'ws');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': backendTarget,
        '/auth': backendTarget,
        '/search': backendTarget,
        '/events': backendTarget,
        '/ws': {
          target: wsTarget,
          ws: true
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts'
    }
  };
});

