/**
 * seller/store — P2-13 매장 이름·상태 / P2-10 영업시간 설정 / P2-07 영업 상태 전이 / P2-06 매장 정보 수정.
 *
 * 사장 앱 제약:
 *   - AuthBootstrap 없음 → 하드 리로드(spaGotoFresh) 금지. 화면 갱신은 spaGoto(SPA 네비)만.
 *   - worker 당 seller(매장) 공유(worker-scoped) → 상태 변경 주의.
 *
 * 테스트 순서 (파일 내 선형 실행):
 *   P2-13 → P2-10 → P2-07 → P2-06
 *   P2-06 이 매장명을 변경하므로, 원래 매장명을 검증하는 P2-13 을 먼저 배치.
 *
 * P2-07 영업 상태 전이는 openFreshSellerPage(격리) 사용 — 상태 변경이 공유 seller 에 영향 없음.
 * 주소 변경(Daum 우편번호 위젯 팝업) 자동화 불가 — P2-06 에서 미포함.
 *
 * TimePicker(커스텀 합성 피커) 실클릭: `pickTime` 헬퍼 참조.
 */
import type { Page } from '@playwright/test'
import { test, expect, openFreshSellerPage } from '../../fixtures/seller-test'
import { spaGoto } from '../../fixtures/navigation'

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────

/**
 * StoreSwitcher 가 첫 매장을 자동 선택(selectedStoreId 설정)할 때까지 대기.
 * clearance.spec 와 동일 패턴.
 */
async function waitForStoreReady(page: Page, storeName: string): Promise<void> {
  await expect(page.getByText(storeName)).toBeVisible({ timeout: 10_000 })
}

/**
 * 커스텀 TimePicker(시·분 컬럼 role="listbox") 실클릭.
 * 트리거 버튼 → 패널 열기 → 시·분 옵션 순차 클릭. 패널 열린 채 반환.
 * (clearance.spec 의 pickTime 와 동일 구현 — spec 자급)
 *
 * @param ariaLabel  TimePicker 트리거 버튼의 aria-label ("오픈 시각" / "마감 시각" / "픽업 마감 시각" 등)
 * @param hour       zero-padded 시 ("00"~"23")
 * @param minute     zero-padded 분 ("00"~"59")
 */
async function pickTime(
  page: Page,
  ariaLabel: string,
  hour: string,
  minute: string,
): Promise<void> {
  await page.getByRole('button', { name: ariaLabel }).click()
  await page
    .getByRole('listbox', { name: '시' })
    .getByRole('option', { name: hour, exact: true })
    .click()
  await page
    .getByRole('listbox', { name: '분' })
    .getByRole('option', { name: minute, exact: true })
    .click()
}

// ── P2-13 매장 이름·상태 표시 (/store) ────────────────────────────────────────

test.describe('P2-13 매장 이름·상태 표시', () => {
  /**
   * /store (StoreManagePage) 헤드 카드에 현재 매장 이름과 영업 상태 라벨이 표시되는지 확인.
   *
   * - 매장 이름: useStores() → stores[0].name (StoreSwitcher 로 설정된 selectedStoreId 기준)
   * - 영업 상태: useStoreStatus() → getStatusLabel(OPEN, todayCloseTime) → "영업중 · HH:MM 마감" 또는 "영업중"
   *   seller fixture 생성 시 7일 영업시간 + OPEN 전환 보장 → OPEN 상태.
   */
  test('/store 진입 시 현재 매장 이름과 영업 상태 라벨 표시', async ({ sellerPage, seller }) => {
    // StoreSwitcher 가 selectedStoreId 를 설정할 때까지 대기 (홈)
    await waitForStoreReady(sellerPage, seller.store.name)

    // /store 로 SPA 네비
    await spaGoto(sellerPage, '/store')

    // 페이지 제목
    await expect(sellerPage.getByRole('heading', { name: '매장 관리' })).toBeVisible()

    // 헤드 카드: 매장 이름 표시 — useStores 로드 후 (최대 10초)
    await expect(sellerPage.getByText(seller.store.name)).toBeVisible({ timeout: 10_000 })

    // 헤드 카드: 영업 상태 라벨 — OPEN → "영업중" 접두어
    await expect(sellerPage.getByText(/영업중/)).toBeVisible({ timeout: 10_000 })
  })
})

// ── P2-10 영업시간 설정 ────────────────────────────────────────────────────────

test.describe('P2-10 영업시간 설정', () => {
  /**
   * 월요일 영업시간 편집 시트(BusinessHourEditSheet) → 오픈 시각 10:00 으로 변경 → 저장 →
   * 목록 행 반영 + API 커밋("변경 저장") + 성공 메시지.
   *
   * - 오늘 = 일요일(Date 2026-06-14 KST, getDay()=0 → WEEKDAYS[0]='sun').
   *   OPEN + 일요일 영업일 → "일요일 영업시간 편집" 행 잠금(Lock 아이콘, 클릭 불가).
   *   → 잠금 아닌 "월요일 영업시간 편집" 편집.
   *
   * - seller fixture 영업시간: 09:00 – 22:00 (전 요일). 월요일 오픈 09:00 → 10:00 변경.
   * - formatRange 는 en-dash (–) 사용: "10:00 – 22:00" (U+2013).
   * - 성공 메시지: "영업시간을 저장했어요."
   */
  test('오픈 시각 10:00 변경 → 저장 → 화면 반영 + 성공 메시지', async ({ sellerPage, seller }) => {
    // ★오늘 요일은 OPEN 매장에서 영업시간 변경이 잠긴다(TODAY_BUSINESS_HOURS_LOCKED) → **오늘이 아닌
    //  요일**을 편집해 날짜 의존 깨짐을 피한다(과거 '월요일' 하드코딩은 월요일에 실행 시 실패).
    const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
    const todayIdx = (new Date(Date.now() + 9 * 3600 * 1000).getUTCDay() + 6) % 7 // 월=0 (KST)
    const editDay = DAYS[(todayIdx + 2) % 7]

    await waitForStoreReady(sellerPage, seller.store.name)

    // /store/hours 진입
    await spaGoto(sellerPage, '/store/hours')
    await expect(sellerPage.getByRole('heading', { name: '영업시간' })).toBeVisible()

    // 영업시간 목록 로드 대기 — "불러오는 중…" 사라질 때까지
    await expect(sellerPage.getByText('불러오는 중…')).not.toBeVisible({ timeout: 10_000 })

    // 오늘이 아닌 요일 행 편집 진입 (잠금 아님)
    await sellerPage.getByRole('button', { name: `${editDay} 영업시간 편집` }).click()

    // BusinessHourEditSheet 오픈 확인
    const sheet = sellerPage.getByRole('dialog')
    await expect(sheet).toBeVisible()
    await expect(sellerPage.getByText(`${editDay} 영업시간`)).toBeVisible()

    // 오픈 시각 10:00 으로 변경 (TimePicker 실클릭)
    await pickTime(sellerPage, '오픈 시각', '10', '00')

    // 시트 "저장" 클릭 → TimePicker 패널 닫힘(외부 mousedown) + 드래프트 커밋 + 시트 닫힘
    await sheet.getByRole('button', { name: '저장' }).click()
    await expect(sheet).not.toBeVisible({ timeout: 10_000 })

    // 목록 행 반영: 월요일 "10:00 – 22:00" (en-dash U+2013)
    await expect(sellerPage.getByText('10:00 – 22:00')).toBeVisible()

    // "변경 저장" 클릭 → API PUT 영업시간 커밋
    await sellerPage.getByRole('button', { name: '변경 저장' }).click()

    // 성공 메시지 (role=status)
    await expect(sellerPage.getByText('영업시간을 저장했어요.')).toBeVisible({ timeout: 10_000 })
  })
})

// ── P2-07 영업 상태 전이 ──────────────────────────────────────────────────────

test.describe('P2-07 영업 상태 전이', () => {
  /**
   * BizStatusCard(홈 페이지) "관리" 버튼 → BizStatusSheet → 상태 전환.
   * 각 테스트는 openFreshSellerPage(격리) 사용 — 전이가 공유 seller 에 영향 없음.
   * openFreshSellerPage 는 국세청 실호출 → 총 3회 (OPEN→BREAK, BREAK→OPEN, OPEN→CLOSED_TODAY).
   *
   * seller fixture 7일 영업시간 보장 → canOpenToday=true → "영업 재개" 액션 활성화.
   *
   * BizStatusSheet 버튼 텍스트: 이모지 + 라벨 + 설명 포함 → filter({ hasText: }) 로 매칭.
   * 전환 후 BizStatusCard 상태 라벨:
   *   BREAK     → "잠시 휴식중"
   *   OPEN      → /영업중/ (마감 시각 포함 여부 관계없이)
   *   CLOSED_TODAY → "오늘 영업 종료"
   */

  test('OPEN → BREAK 전이', async ({ browser }) => {
    const { seller, page, close } = await openFreshSellerPage(browser)
    try {
      // 홈: StoreSwitcher 매장명 + BizStatusCard 상태 로드 대기
      await waitForStoreReady(page, seller.store.name)
      const manageBtn = page.getByRole('button', { name: '관리' })
      await expect(manageBtn).toBeEnabled({ timeout: 10_000 })

      // BizStatusSheet 열기
      await manageBtn.click()
      const sheet = page.getByRole('dialog', { name: '영업 상태 관리' })
      await expect(sheet).toBeVisible()
      await expect(page.getByText('현재 영업 중이에요.')).toBeVisible()

      // "잠시 휴식" 액션 클릭
      await page.getByRole('button').filter({ hasText: '잠시 휴식' }).first().click()

      // 시트 닫힘 + BizStatusCard "잠시 휴식중" 표시
      await expect(sheet).not.toBeVisible({ timeout: 15_000 })
      await expect(page.getByText('잠시 휴식중')).toBeVisible({ timeout: 10_000 })
    } finally {
      await close()
    }
  })

  test('BREAK → OPEN 전이 (OPEN→BREAK→OPEN 순서로 격리 검증)', async ({ browser }) => {
    const { seller, page, close } = await openFreshSellerPage(browser)
    try {
      await waitForStoreReady(page, seller.store.name)
      const manageBtn = page.getByRole('button', { name: '관리' })
      await expect(manageBtn).toBeEnabled({ timeout: 10_000 })

      // ① OPEN → BREAK
      await manageBtn.click()
      const sheet = page.getByRole('dialog', { name: '영업 상태 관리' })
      await expect(sheet).toBeVisible()
      await page.getByRole('button').filter({ hasText: '잠시 휴식' }).first().click()
      await expect(sheet).not.toBeVisible({ timeout: 15_000 })
      await expect(page.getByText('잠시 휴식중')).toBeVisible({ timeout: 10_000 })

      // ② BREAK → OPEN (영업 재개)
      await manageBtn.click()
      await expect(sheet).toBeVisible()
      await expect(page.getByText('잠시 휴식 중이에요.')).toBeVisible()

      // "영업 재개" 액션 (canOpenToday=true → 활성화)
      await page.getByRole('button').filter({ hasText: '영업 재개' }).first().click()

      // 시트 닫힘 + "영업중" 표시
      await expect(sheet).not.toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(/영업중/)).toBeVisible({ timeout: 10_000 })
    } finally {
      await close()
    }
  })

  test('OPEN → CLOSED_TODAY 전이', async ({ browser }) => {
    const { seller, page, close } = await openFreshSellerPage(browser)
    try {
      await waitForStoreReady(page, seller.store.name)
      const manageBtn = page.getByRole('button', { name: '관리' })
      await expect(manageBtn).toBeEnabled({ timeout: 10_000 })

      // BizStatusSheet 열기
      await manageBtn.click()
      const sheet = page.getByRole('dialog', { name: '영업 상태 관리' })
      await expect(sheet).toBeVisible()
      await expect(page.getByText('현재 영업 중이에요.')).toBeVisible()

      // "오늘 영업 종료" 액션
      await page.getByRole('button').filter({ hasText: '오늘 영업 종료' }).first().click()

      // 시트 닫힘 + "오늘 영업 종료" 표시
      await expect(sheet).not.toBeVisible({ timeout: 15_000 })
      await expect(page.getByText('오늘 영업 종료')).toBeVisible({ timeout: 10_000 })
    } finally {
      await close()
    }
  })
})

// ── P2-06 매장 정보 수정 ──────────────────────────────────────────────────────

test.describe('P2-06 매장 정보 수정', () => {
  /**
   * 매장명·전화번호 변경 → "저장" 제출 → /store 로 navigate + 헤드 카드에 새 이름 표시.
   *
   * StoreEditForm 설계:
   *   - 주소 미변경 시 storeAddress=null → PATCH 에서 주소 필드 omit (Daum 재검색 없이 OK).
   *   - canSave = storeName.trim().length > 0 AND storePhone.trim().length > 0.
   *   - onSuccess → navigate(ROUTES.STORE_MANAGE) → URL = '/store'.
   *
   * 주소 변경(Daum 우편번호 위젯 팝업)은 Playwright 로 자동화 불가 → 미포함(명세 제외).
   *
   * P2-06 이 매장명을 변경 → 이 테스트는 파일 내 마지막에 배치 (P2-13 이 원래 이름 확인 후).
   */
  test('매장명·전화번호 변경 → 저장 → /store 에 새 이름 표시', async ({
    sellerPage,
    seller,
  }) => {
    await waitForStoreReady(sellerPage, seller.store.name)

    // /store/edit 진입
    await spaGoto(sellerPage, '/store/edit')
    await expect(sellerPage.getByRole('heading', { name: '매장 정보 수정' })).toBeVisible()

    // StoreEditForm 로드 대기 — detail(매장 상세) 로드 후 폼 렌더
    const nameInput = sellerPage.getByRole('textbox', { name: '매장명' })
    await expect(nameInput).toBeVisible({ timeout: 10_000 })

    // 매장명 변경
    const newName = `E2E수정매장${Date.now()}`
    await nameInput.fill(newName)

    // 전화번호 변경 (canSave 조건 충족 유지)
    const phoneInput = sellerPage.getByRole('textbox', { name: '매장 전화번호' })
    await phoneInput.fill('02-1234-5678')

    // "저장" 제출 (submit 버튼 — canSave=true + isPending=false)
    const saveBtn = sellerPage.getByRole('button', { name: '저장' })
    await expect(saveBtn).toBeEnabled()
    await saveBtn.click()

    // 저장 성공 → navigate('/store')
    await sellerPage.waitForURL((url) => url.pathname === '/store', { timeout: 15_000 })

    // /store 헤드 카드에 새 이름 반영 (useStores 쿼리 invalidation 후 refetch)
    await expect(sellerPage.getByText(newName)).toBeVisible({ timeout: 10_000 })
  })
})
