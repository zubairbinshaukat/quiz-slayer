import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeManifestIcons: false,
      includeAssets: ['favicon-96.png', 'favicon.ico', 'apple-touch-icon.png', 'sounds/*.mp3'],
      manifest: {
        name: 'Quiz Slayer',
        short_name: 'Quiz Slayer',
        description: 'Study smarter with interactive quizzes for your university subjects.',
        theme_color: '#0B0B0F',
        background_color: '#0B0B0F',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json,mp3,woff2}'],
        // 3D icons are fetched on demand (runtime cache below); non-Latin font subsets load only if needed;
        // install icons and the social card are never shown inside the app
        globIgnores: ['**/icons3d/**', '**/*cyrillic*.woff2', '**/*vietnamese*.woff2', 'pwa-*.png', 'og-image.png'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/icons3d\/[^/]+\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'icons3d',
              expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
