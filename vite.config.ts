import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'pwa-manifest-header-and-sync',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && (req.url.startsWith('/manifest.json') || req.url.startsWith('/sw.js') || req.url.startsWith('/service-worker.js'))) {
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Expires', '0');
            }
            next();
          });
        },
        closeBundle() {
          const distHtml = path.resolve(__dirname, 'dist/index.html');
          if (fs.existsSync(distHtml)) {
            let html = fs.readFileSync(distHtml, 'utf-8');
            html = html.replace(/href="\/assets\/manifest-[^"]+"/g, 'href="/manifest.json"');
            html = html.replace(/href="manifest\.json[^"]*"/g, 'href="/manifest.json"');
            fs.writeFileSync(distHtml, html);
          }

          // Ensure dist/manifest.json is always synced with public/manifest.json
          const pubManifest = path.resolve(__dirname, 'public/manifest.json');
          const distManifest = path.resolve(__dirname, 'dist/manifest.json');
          if (fs.existsSync(pubManifest)) {
            fs.copyFileSync(pubManifest, distManifest);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
