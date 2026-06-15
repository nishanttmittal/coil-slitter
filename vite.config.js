import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/coil-slitter/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/coil-slitter/',
      includeAssets: ['apple-touch-icon.png'],
      workbox: {
        navigateFallback: '/coil-slitter/index.html',
        navigateFallbackAllowlist: [/^\/coil-slitter/],
      },
      manifest: {
        name: 'Coil Slitting Optimizer',
        short_name: 'CoilSlit',
        description: 'Plan coil slitting layouts across two passes with minimum waste',
        theme_color: '#1e3a5f',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/coil-slitter/',
        scope: '/coil-slitter/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
