import { test, expect } from '../../fixtures/admin-test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P11-03 공지사항 관리 (admin)
 *
 * 대상: https://admin.dev.magampick.com/announcements
 * 엔드포인트: POST/GET/PATCH/DELETE /admin/announcements
 *
 * 단일 공유 admin 계정 → 유니크 제목(접두어 + Date.now())으로 병렬 충돌 방지.
 * adminPage: loginAdmin 쿠키 주입 → AuthBootstrap silent refresh → 인증 부팅 완료 상태.
 *
 * 태그 enum: notice='공지', event='이벤트', update='업데이트' (NOTICE_TAG_LABEL)
 * 삭제 확인: DeleteAnnouncementDialog (커스텀 모달) — window.confirm 아님.
 */

/** 병렬 안전 유니크 제목 */
function uid(prefix: string): string {
  return `${prefix} ${Date.now()}`
}

// ─── 헬퍼: /announcements 진입 후 로딩 완료 대기 ─────────────────────────────
async function gotoAnnouncements(page: Parameters<typeof spaGoto>[0]) {
  await spaGoto(page, '/announcements')
  await expect(page.getByRole('heading', { name: '공지사항 관리' })).toBeVisible()
  // 테이블 또는 EmptyState 가 나타날 때까지 대기
  await Promise.race([
    page.getByRole('table').waitFor({ state: 'visible' }).catch(() => null),
    page.getByText('등록된 공지가 없어요').waitFor({ state: 'visible' }).catch(() => null),
  ])
}

// ─── 헬퍼: 생성 다이얼로그 열고 발행 ────────────────────────────────────────
async function createAnnouncement(
  page: Parameters<typeof spaGoto>[0],
  opts: {
    title: string
    body?: string
    tag?: '공지' | '이벤트' | '업데이트'
    pinned?: boolean
  },
) {
  await page.getByRole('button', { name: '새 공지' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('heading', { name: '새 공지' })).toBeVisible()

  // 태그 변경 (기본값 '공지', 변경 필요 시만)
  if (opts.tag && opts.tag !== '공지') {
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: opts.tag }).click()
  }

  // 핀 고정 (기본값 OFF)
  if (opts.pinned) {
    await page.getByRole('switch', { name: '상단 고정' }).click()
  }

  // 제목 + 본문
  await page.getByPlaceholder('예) 서비스 점검 안내').fill(opts.title)
  await page.getByPlaceholder('공지 내용을 입력해 주세요').fill(opts.body ?? 'E2E 테스트 본문입니다.')

  // 발행
  await page.getByRole('button', { name: '발행' }).click()

  // 다이얼로그 닫힘 + 목록에 제목 노출 자동 대기
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByText(opts.title)).toBeVisible()
}

// ─────────────────────────────────────────────────────────────────────────────
// 생성
// ─────────────────────────────────────────────────────────────────────────────
test.describe('P11-03 생성', () => {
  test('새 공지 다이얼로그 → 제목·본문 입력 → 발행 → 목록 노출', async ({ adminPage }) => {
    const title = uid('[E2E] 공지 생성')

    await gotoAnnouncements(adminPage)
    await createAnnouncement(adminPage, { title, body: '생성 테스트 본문' })

    // 목록 테이블에 제목이 셀로 표시됨
    const row = adminPage.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()
    // 태그 배지 '공지' (기본)
    await expect(row.getByText('공지', { exact: true })).toBeVisible()
  })

  test('태그=이벤트 로 생성하면 목록 행에 이벤트 배지가 표시된다', async ({ adminPage }) => {
    const title = uid('[E2E] 이벤트 태그')

    await gotoAnnouncements(adminPage)

    await adminPage.getByRole('button', { name: '새 공지' }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible()

    // 태그 → 이벤트 선택
    await adminPage.getByRole('combobox').click()
    await adminPage.getByRole('option', { name: '이벤트' }).click()

    await adminPage.getByPlaceholder('예) 서비스 점검 안내').fill(title)
    await adminPage.getByPlaceholder('공지 내용을 입력해 주세요').fill('이벤트 태그 본문')
    await adminPage.getByRole('button', { name: '발행' }).click()
    await expect(adminPage.getByRole('dialog')).not.toBeVisible()

    const row = adminPage.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()
    await expect(row.getByText('이벤트', { exact: true })).toBeVisible()
  })

  test('태그=업데이트 로 생성하면 목록 행에 업데이트 배지가 표시된다', async ({ adminPage }) => {
    const title = uid('[E2E] 업데이트 태그')

    await gotoAnnouncements(adminPage)

    await adminPage.getByRole('button', { name: '새 공지' }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible()

    await adminPage.getByRole('combobox').click()
    await adminPage.getByRole('option', { name: '업데이트' }).click()

    await adminPage.getByPlaceholder('예) 서비스 점검 안내').fill(title)
    await adminPage.getByPlaceholder('공지 내용을 입력해 주세요').fill('업데이트 태그 본문')
    await adminPage.getByRole('button', { name: '발행' }).click()
    await expect(adminPage.getByRole('dialog')).not.toBeVisible()

    const row = adminPage.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()
    await expect(row.getByText('업데이트', { exact: true })).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 수정
// ─────────────────────────────────────────────────────────────────────────────
test.describe('P11-03 수정', () => {
  test('수정 버튼 → 제목 변경 → 수정 저장 → 새 제목 반영, 기존 제목 사라짐', async ({
    adminPage,
  }) => {
    const origTitle = uid('[E2E] 수정 전')
    const newTitle = uid('[E2E] 수정 후')

    await gotoAnnouncements(adminPage)
    await createAnnouncement(adminPage, { title: origTitle, body: '수정 전 본문' })

    // 해당 행 수정 버튼 클릭
    const row = adminPage.getByRole('row').filter({ hasText: origTitle })
    await row.getByRole('button', { name: '수정' }).click()

    // 수정 다이얼로그 확인
    await expect(adminPage.getByRole('dialog')).toBeVisible()
    await expect(adminPage.getByRole('heading', { name: '공지 수정' })).toBeVisible()

    // 제목 변경
    const titleInput = adminPage.getByPlaceholder('예) 서비스 점검 안내')
    await titleInput.clear()
    await titleInput.fill(newTitle)

    // 수정 저장
    await adminPage.getByRole('button', { name: '수정 저장' }).click()
    await expect(adminPage.getByRole('dialog')).not.toBeVisible()

    // 새 제목 목록 반영 · 기존 제목 사라짐
    await expect(adminPage.getByText(newTitle)).toBeVisible()
    await expect(adminPage.getByText(origTitle)).not.toBeVisible()
  })

  test('수정 다이얼로그에 기존 값이 프리필된다', async ({ adminPage }) => {
    const title = uid('[E2E] 프리필 확인')
    const body = '프리필 테스트 본문'

    await gotoAnnouncements(adminPage)
    await createAnnouncement(adminPage, { title, body })

    // 수정 다이얼로그 열기
    const row = adminPage.getByRole('row').filter({ hasText: title })
    await row.getByRole('button', { name: '수정' }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible()

    // 제목 필드에 기존 값 프리필 확인
    await expect(adminPage.getByPlaceholder('예) 서비스 점검 안내')).toHaveValue(title)

    // 취소 (정리)
    await adminPage.getByRole('button', { name: '취소' }).click()
    await expect(adminPage.getByRole('dialog')).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 삭제
// ─────────────────────────────────────────────────────────────────────────────
test.describe('P11-03 삭제', () => {
  test('삭제 버튼 → 확인 다이얼로그 → 삭제 클릭 → 목록에서 사라짐', async ({ adminPage }) => {
    const title = uid('[E2E] 삭제 테스트')

    await gotoAnnouncements(adminPage)
    await createAnnouncement(adminPage, { title, body: '삭제 테스트 본문' })

    // 해당 행 삭제 버튼 클릭
    const row = adminPage.getByRole('row').filter({ hasText: title })
    await row.getByRole('button', { name: '삭제' }).click()

    // DeleteAnnouncementDialog (커스텀 모달)
    await expect(adminPage.getByRole('dialog')).toBeVisible()
    await expect(adminPage.getByRole('heading', { name: '공지 삭제' })).toBeVisible()
    // 다이얼로그 설명에 공지 제목 포함
    await expect(adminPage.getByRole('dialog').getByText(title)).toBeVisible()

    // 삭제 확인 (destructive 버튼 — 다이얼로그 내부)
    await adminPage.getByRole('dialog').getByRole('button', { name: '삭제' }).click()

    // 다이얼로그 닫힘 + 목록에서 사라짐
    await expect(adminPage.getByRole('dialog')).not.toBeVisible()
    await expect(adminPage.getByText(title)).not.toBeVisible()
  })

  test('삭제 확인 다이얼로그에서 취소를 누르면 공지가 유지된다', async ({ adminPage }) => {
    const title = uid('[E2E] 취소 후 유지')

    await gotoAnnouncements(adminPage)
    await createAnnouncement(adminPage, { title, body: '취소 테스트 본문' })

    // 삭제 버튼 클릭
    const row = adminPage.getByRole('row').filter({ hasText: title })
    await row.getByRole('button', { name: '삭제' }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible()

    // 취소 클릭
    await adminPage.getByRole('button', { name: '취소' }).click()
    await expect(adminPage.getByRole('dialog')).not.toBeVisible()

    // 공지 여전히 목록에 존재
    await expect(adminPage.getByText(title)).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 핀 고정 정렬
// ─────────────────────────────────────────────────────────────────────────────
test.describe('P11-03 핀 고정', () => {
  test('핀 고정 공지가 일반 공지보다 상단에 표시된다 (pinned→최신 정렬)', async ({
    adminPage,
  }) => {
    // 일반 공지를 먼저 생성 → 핀 공지를 나중에 생성
    // sortAnnouncements: pinned DESC → date DESC → id DESC
    // 핀 공지는 pinned=true → 상단, 일반 공지는 아래
    const unpinnedTitle = uid('[E2E] 일반 공지')
    const pinnedTitle = uid('[E2E] 핀 고정')

    await gotoAnnouncements(adminPage)

    // 1. 일반 공지 생성 (핀 OFF)
    await createAnnouncement(adminPage, { title: unpinnedTitle })

    // 2. 핀 고정 공지 생성 (핀 ON) — 일반 공지보다 나중에 생성(더 작은 id)해도 핀이 우선
    await adminPage.getByRole('button', { name: '새 공지' }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible()
    await adminPage.getByRole('switch', { name: '상단 고정' }).click() // 핀 ON
    await adminPage.getByPlaceholder('예) 서비스 점검 안내').fill(pinnedTitle)
    await adminPage.getByPlaceholder('공지 내용을 입력해 주세요').fill('핀 고정 본문')
    await adminPage.getByRole('button', { name: '발행' }).click()
    await expect(adminPage.getByRole('dialog')).not.toBeVisible()
    await expect(adminPage.getByText(pinnedTitle)).toBeVisible()

    // 3. 목록 행 순서 비교: pinnedTitle 행이 unpinnedTitle 행보다 위여야 함
    const rows = adminPage.getByRole('row')
    const allRows = await rows.all()

    let pinnedRowIdx = -1
    let unpinnedRowIdx = -1
    for (let i = 0; i < allRows.length; i++) {
      const text = await allRows[i].textContent()
      if (text?.includes(pinnedTitle)) pinnedRowIdx = i
      if (text?.includes(unpinnedTitle)) unpinnedRowIdx = i
    }

    expect(pinnedRowIdx, '핀 공지 행을 찾지 못함').toBeGreaterThan(-1)
    expect(unpinnedRowIdx, '일반 공지 행을 찾지 못함').toBeGreaterThan(-1)
    expect(pinnedRowIdx, '핀 공지가 일반 공지보다 위에 있어야 함').toBeLessThan(unpinnedRowIdx)
  })

  test('핀 ON 으로 생성하면 Pin 아이콘(aria-label=상단 고정)이 행에 표시된다', async ({
    adminPage,
  }) => {
    const title = uid('[E2E] 핀 아이콘')

    await gotoAnnouncements(adminPage)

    await adminPage.getByRole('button', { name: '새 공지' }).click()
    await adminPage.getByRole('switch', { name: '상단 고정' }).click() // 핀 ON
    await adminPage.getByPlaceholder('예) 서비스 점검 안내').fill(title)
    await adminPage.getByPlaceholder('공지 내용을 입력해 주세요').fill('핀 아이콘 테스트')
    await adminPage.getByRole('button', { name: '발행' }).click()
    await expect(adminPage.getByRole('dialog')).not.toBeVisible()

    // AnnouncementsTable: pinned=true → <Pin aria-label="상단 고정" />
    const row = adminPage.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()
    await expect(row.getByLabel('상단 고정')).toBeVisible()
  })
})
