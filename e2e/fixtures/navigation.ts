import type { Page } from '@playwright/test'

/**
 * ★ dev 배포 제약 (fixtures 단계 발견): Vercel 배포에 SPA catch-all rewrite 가 없어 **deep-link goto 는
 * 엣지 404** 가 된다 (`/`만 index.html 을 서빙). 따라서 모든 라우트 이동은 **클라이언트 라우팅**으로만.
 * (cf. memory `dev-protected-route-auth-reload`: 직접 URL/새로고침 불가 → SPA 네비로 우회.)
 *
 * spaGoto: 루트에서 SPA 를 띄운 뒤 history.pushState + popstate 로 React Router(v7)를 이동시킨다.
 * page.goto(path) 를 직접 쓰지 말 것 — 404 난다.
 */
export async function spaGoto(page: Page, path: string): Promise<void> {
  const origin = new URL(page.url() === 'about:blank' ? 'https://dev.magampick.com' : page.url())
    .origin

  // SPA 가 아직 안 떠 있으면(about:blank 또는 다른 곳) 루트부터 로드해 라우터·AuthBootstrap 기동
  if (!page.url().startsWith(origin) || new URL(page.url()).pathname === '/blank') {
    await page.goto(origin + '/')
  }

  await page.evaluate((p) => {
    window.history.pushState({}, '', p)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, path)
}

/**
 * 하드 리로드 후 SPA 라우팅. **외부(API)로 데이터를 바꾼 뒤** 그 변경을 화면에 반영할 때 쓴다 —
 * QueryClient staleTime 이 1분이라(`providers.tsx`), 시드 전에 캐시된 쿼리는 일반 spaGoto 로는
 * 갱신되지 않는다. 루트를 다시 로드해 QueryClient 캐시를 비우고(+AuthBootstrap 재부팅) 이동한다.
 */
export async function spaGotoFresh(page: Page, path: string): Promise<void> {
  const origin = new URL(page.url() === 'about:blank' ? 'https://dev.magampick.com' : page.url())
    .origin
  await page.goto(origin + '/')
  await spaGoto(page, path)
}
