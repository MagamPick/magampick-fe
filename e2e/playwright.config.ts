import { defineConfig, devices } from '@playwright/test'
import { TARGETS, SEED_GPS } from './fixtures/env'

/**
 * 마감픽 E2E — 대상 = **배포된 dev** (실 BE: api.dev.magampick.com).
 * 로컬 빌드/서버 없음. CI 게이트 아님 (CI 는 lint+build 만; e2e 패키지엔 build/lint/test 스크립트 없음).
 *
 * 레이어 구조 (e2e-plan §2):
 *   customer/ seller/ admin/  = per-app app-local (각자 baseURL)
 *   journeys/                 = cross-app 멀티컨텍스트 (baseURL 미지정, 스펙이 직접 컨텍스트 생성)
 *
 * 데이터 격리: 각 테스트가 fixtures(test.ts)로 고유 계정을 API 생성 → 병렬 안전.
 */
export default defineConfig({
  testDir: '.',
  // fixtures/ 는 스펙이 아님 — 앱 폴더의 *.spec.ts 만 수집
  testMatch: /(customer|seller|admin|journeys)[/\\].*\.spec\.ts$/,

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1, // 배포 dev 네트워크 변동 흡수
  workers: process.env.CI ? 1 : 4, // dev 공유 환경 — 과도한 동시 계정생성/부하 방지
  reporter: [['list'], ['html', { open: 'never' }]],

  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  projects: [
    {
      name: 'customer',
      testMatch: /customer[/\\].*\.spec\.ts$/,
      use: {
        baseURL: TARGETS.customer,
        viewport: { width: 393, height: 852 }, // 모바일 PWA
        permissions: ['geolocation'],
        geolocation: SEED_GPS,
      },
    },
    {
      name: 'seller',
      testMatch: /seller[/\\].*\.spec\.ts$/,
      use: {
        baseURL: TARGETS.seller,
        viewport: { width: 393, height: 852 }, // 모바일 PWA
        permissions: ['geolocation'],
        geolocation: SEED_GPS,
      },
    },
    {
      name: 'admin',
      testMatch: /admin[/\\].*\.spec\.ts$/,
      use: {
        baseURL: TARGETS.admin,
        ...devices['Desktop Chrome'], // admin = 일반 데스크톱 웹
      },
    },
    {
      name: 'journeys',
      testMatch: /journeys[/\\].*\.spec\.ts$/,
      // cross-app: baseURL 없음 — 스펙이 앱별 컨텍스트를 직접 생성
    },
  ],
})
