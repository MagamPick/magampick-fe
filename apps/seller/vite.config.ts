/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: { port: 5174 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // jsdom environment 셋업이 무거운 환경에서 파일 병렬 실행 시 worker 메모리 크래시(exit 134).
    // 순차 실행으로 안정화 (테스트 파일 수가 적어 비용 미미).
    fileParallelism: false,
  },
})
