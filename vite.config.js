import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: __dirname,
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api/tts': {
        target: 'https://translate.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, '/translate_tts'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('origin');
          });
        }
      }
    }
  },
});
