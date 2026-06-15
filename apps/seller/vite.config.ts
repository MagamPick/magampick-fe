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
    // PWA (pwa-convention §2·§10). 사장용 — name/short_name 으로 소비자 앱과 구분.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // firebase-messaging-sw.js 는 FCM 전용 SW(별도 scope 로 직접 등록) — Workbox precache 대상에서 제외.
        globIgnores: ['**/firebase-messaging-sw.js'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
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
        name: '마감픽 사장 - 매장 마감 관리',
        short_name: '마감픽 사장',
        description: '마감 임박 상품 등록부터 주문 / 픽업 관리까지 — 마감픽 사장용 앱',
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
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: { port: 5174 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      // 실 연동(apiClient) 도입 — 테스트에서도 env(VITE_API_BASE_URL) 파싱이 통과하도록 주입
      VITE_API_BASE_URL: 'http://localhost:8080',
    },
    // jsdom environment 셋업이 무거운 환경에서 파일 병렬 실행 시 worker 메모리 크래시(exit 134).
    // 순차 실행으로 안정화 (테스트 파일 수가 적어 비용 미미).
    fileParallelism: false,
  },
})
