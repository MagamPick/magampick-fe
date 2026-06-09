/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA (pwa-convention §2). registerType autoUpdate → 새 SW 자동 활성화.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // firebase-messaging-sw.js 는 FCM 전용 SW(별도 scope 로 직접 등록) — Workbox precache 대상에서 제외.
        globIgnores: ['**/firebase-messaging-sw.js'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // 매장/상품/마감임박 조회 — 실시간성 우선, 오프라인 대비 5분 캐시 (pwa-convention §4)
            urlPattern: /\/api\/v1\/(stores|products|clearance-items)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7일
            },
          },
        ],
      },
      manifest: {
        name: '마감픽 - 마감 임박 할인 픽업',
        short_name: '마감픽',
        description: '주변 베이커리 / 카페의 마감 임박 상품을 할인된 가격에 픽업하세요',
        lang: 'ko',
        theme_color: '#ff6b35', // 디자인 토큰 --primary
        background_color: '#f7f7f7', // 디자인 토큰 --background
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: true, // 개발 모드에서도 PWA 동작 확인 가능
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      // 실 연동(apiClient) 도입 — 테스트에서도 env(VITE_API_BASE_URL) 파싱이 통과하도록 주입
      VITE_API_BASE_URL: 'http://localhost:8080',
    },
  },
})
