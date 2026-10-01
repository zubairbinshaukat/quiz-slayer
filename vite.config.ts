import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { perfHints } from './vite/perfHints'

const YEAR = 60 * 60 * 24 * 365

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const convexUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_CONVEX_URL

  return {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
    },
    build: {
      rollupOptions: {
        output: {
          // Vendor code changes rarely: separate chunks stay cached across deploys and download in parallel
          manualChunks(id) {
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) return 'react'
            if (/[\\/]node_modules[\\/]convex[\\/]/.test(id)) return 'convex'
          },
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      perfHints({
        // Mirrors src/router.tsx
        routes: {
          '/': 'LandingPage',
          '/quiz/*': 'QuizPage',
          '/analytics': 'AnalyticsPage',
          '/history': 'HistoryPage',
          '/leaderboard': 'LeaderboardPage',
          '/upload': 'UploadPage',
          '/link': 'LinkPage',
        },
        // Body text + headings; Geist Mono and the extended subsets load when first used
        fonts: [/geist-latin-wght-normal-/, /bricolage-grotesque-latin-wght-normal-/],
        preconnect: convexUrl ? [new URL(convexUrl).origin] : [],
      }),
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
          // Lets the browser tab ask (navigator.getInstalledRelatedApps) whether this app is installed
          related_applications: [{ platform: 'webapp', url: 'https://quiz.zubyr.dev/manifest.webmanifest' }],
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // The precache is the offline app shell: every route chunk, Latin fonts, sounds, the logo.
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json,mp3,woff2}'],
          // Fetched on demand instead (runtime caches below): 3D icons, leaderboard avatars (online-only views),
          // non-Latin font subsets; install icons and the social card are never shown inside the app
          globIgnores: [
            '**/icons3d/**',
            '**/emoji3d/**',
            '**/*-{cyrillic,cyrillic-ext,vietnamese,latin-ext,symbols2}-wght-*.woff2',
            'pwa-*.png',
            'og-image.png',
          ],
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: /\/(icons3d|emoji3d)\/[^/]+\.webp$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-3d',
                expiration: { maxEntries: 260, maxAgeSeconds: YEAR, purgeOnQuotaError: true },
              },
            },
            {
              urlPattern: /\/assets\/[^/]+\.woff2$/,
              handler: 'CacheFirst',
              options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: YEAR } },
            },
          ],
        },
      }),
    ],
  }
})
