/**
 * seller/clearance — P3-07 떨이 등록 / P3-08 떨이 수정(남은개수) / P3-10 떨이 수동 마감.
 *
 * P3-09 자동 마감(픽업 시각 도달 / 수량 0)은 실 타이머·주문 트리거 의존으로 E2E 자동화 불가 — 미자동화.
 *
 * 사장 앱 제약:
 *   - AuthBootstrap 없음 → 하드 리로드(spaGotoFresh) 금지. 화면 갱신은 spaGoto(SPA 네비)만.
 *   - 시드는 해당 데이터 페이지 첫 방문 이전에 완료 (첫 fetch 가 신선해짐).
 *   - worker 당 seller(매장) 공유 → 유니크 상품명 기준으로만 단언.
 *
 * TimePicker(커스텀 합성 피커) 실클릭: `pickTime` 헬퍼 참조.
 * 픽업 마감 시각 "21:00": 매장 영업 종료 22:00 이전, 현재 시각 이후 (21:00 KST 이전 실행 가정).
 */
import type { Page } from '@playwright/test'
import { test, expect } from '../../fixtures/seller-test'
import { spaGoto } from '../../fixtures/navigation'
import { seedProduct, seedClearance } from '../../fixtures/seller'

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

/**
 * StoreSwitcher 가 첫 매장을 자동 선택(selectedStoreId 설정)할 때까지 대기.
 * 사장 앱에는 AuthBootstrap 이 없어 로그인 직후 Zustand selectedStoreId 가 null 이다.
 * 홈 페이지의 StoreSwitcher 가 매장 목록을 fetch 하고 첫 매장명을 렌더링하면 설정 완료.
 * 이 대기가 없으면 spaGoto 로 이동한 페이지에서 쿼리가 비활성화(enabled: false)된다.
 */
async function waitForStoreReady(page: Page, storeName: string): Promise<void> {
  await expect(page.getByText(storeName)).toBeVisible({ timeout: 10_000 })
}

/**
 * 커스텀 TimePicker(시·분 컬럼 role="listbox")를 실클릭으로 조작한다.
 * 트리거 버튼을 눌러 패널을 열고 시·분 옵션을 차례로 선택한다.
 * 패널은 열린 상태로 반환 — 이후 패널 외부 클릭(예: 다음 버튼)의 mousedown 이벤트로 자동 닫힘.
 *
 * @param ariaLabel  TimePicker 트리거 버튼의 aria-label ("픽업 마감 시각" 등)
 * @param hour       시 옵션 텍스트, zero-padded ("00"~"23")
 * @param minute     분 옵션 텍스트, zero-padded ("00"~"59")
 */
async function pickTime(
  page: Page,
  ariaLabel: string,
  hour: string,
  minute: string,
): Promise<void> {
  // 트리거 버튼 클릭 → 시·분 패널 오픈
  await page.getByRole('button', { name: ariaLabel }).click()
  // 시 컬럼: role="listbox" aria-label="시" 안에서 해당 옵션 클릭
  await page
    .getByRole('listbox', { name: '시' })
    .getByRole('option', { name: hour, exact: true })
    .click()
  // 분 컬럼: role="listbox" aria-label="분" 안에서 해당 옵션 클릭
  await page
    .getByRole('listbox', { name: '분' })
    .getByRole('option', { name: minute, exact: true })
    .click()
  // 패널 열린 채로 반환 — 호출자가 외부 클릭(다음 버튼 등)으로 닫음
}

/**
 * 오늘 KST 21:00 ISO 문자열 — seedClearance pickupEndAt 기본값.
 * 매장 영업 종료(22:00) 이전, 21:00 KST 이전 실행 시 현재 시각 이후 조건 충족.
 */
function kst2100Today(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10) + 'T21:00:00'
}

// ── P3-07 떨이 등록 ───────────────────────────────────────────────────────────

test.describe('P3-07 떨이 등록', () => {
  /**
   * seedProduct → 위저드 4스텝(상품 선택 → 수량·가격 → 픽업 시각 → 확인) → 등록 → 떨이 목록 반영.
   *
   * 검증 포인트:
   *   - step1: aria-pressed 상품 버튼 선택
   *   - step2: 수량·할인가 입력 + 할인율 자동 계산 표시 (60%)
   *   - step3: TimePicker 실클릭으로 "21:00" 선택
   *   - step4: 확인 화면 → "마감 할인 등록" 버튼 활성화 → 제출
   *   - POST 성공 → /products?tab=deal 이동 → 떨이 목록에 상품명 출현
   */
  test('seedProduct → 위저드 4스텝 → 떨이 목록 반영', async ({ sellerPage, seller }) => {
    // 0. 시드 — clearance/new 첫 방문 이전에 완료
    const productName = `E2E떨이등록${Date.now()}`
    await seedProduct(seller.token, seller.store.id, {
      name: productName,
      regularPrice: 5000,
      category: 'ETC',
    })

    // StoreSwitcher 가 selectedStoreId 를 설정할 때까지 대기
    await waitForStoreReady(sellerPage, seller.store.name)

    // 1. 떨이 등록 페이지 진입 (SPA 네비)
    await spaGoto(sellerPage, '/clearance/new')
    await expect(sellerPage.getByRole('heading', { name: '마감 할인 등록' })).toBeVisible()

    // ── STEP 1: 상품 선택 ──────────────────────────────────────────────────
    // eligible 상품 목록에서 시드 상품 버튼(aria-pressed) 클릭
    const productBtn = sellerPage
      .locator('button[aria-pressed]')
      .filter({ hasText: productName })
    await expect(productBtn).toBeVisible()
    await productBtn.click()
    await expect(productBtn).toHaveAttribute('aria-pressed', 'true')

    await sellerPage.getByRole('button', { name: '다음' }).click()

    // ── STEP 2: 수량·가격 ─────────────────────────────────────────────────
    await expect(sellerPage.getByPlaceholder('예) 20')).toBeVisible()
    await sellerPage.getByPlaceholder('예) 20').fill('5')          // 마감 할인 수량
    await sellerPage.getByPlaceholder('할인가 입력').fill('2000')  // 마감 할인가

    // 할인율 자동 계산 확인: (5000-2000)/5000 = 60%
    await expect(sellerPage.getByText('60%')).toBeVisible()

    await sellerPage.getByRole('button', { name: '다음' }).click()

    // ── STEP 3: 픽업 마감 시각 (커스텀 TimePicker 실클릭) ─────────────────
    await expect(
      sellerPage.getByRole('button', { name: '픽업 마감 시각' }),
    ).toBeVisible()

    // 21:00 선택 — 매장 영업 종료(22:00) 이전, 21:00 KST 이전 실행 가정
    await pickTime(sellerPage, '픽업 마감 시각', '21', '00')

    // "다음" 클릭: mousedown 이 TimePicker 패널 외부 → 패널 닫힘 + step 진행
    await sellerPage.getByRole('button', { name: '다음' }).click()

    // ── STEP 4: 확인 ──────────────────────────────────────────────────────
    // 선택 정보 표시 확인
    await expect(sellerPage.getByText(productName)).toBeVisible()

    // "마감 할인 등록" 버튼 활성화 + 제출
    const submitBtn = sellerPage.getByRole('button', { name: '마감 할인 등록' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // POST 성공 → /products?tab=deal 이동
    await sellerPage.waitForURL(
      (url) => url.pathname === '/products' && url.search.includes('tab=deal'),
      { timeout: 15_000 },
    )

    // 떨이 목록(진행중 섹션)에 등록 상품명 출현
    await expect(sellerPage.getByText(productName)).toBeVisible()
  })
})

// ── P3-08 떨이 수정 (남은 수량 변경) ─────────────────────────────────────────

test.describe('P3-08 떨이 수정 — 남은 수량', () => {
  /**
   * seedClearance(수량 5) → 마감 할인 탭에서 카드 클릭 → 상세 진입 →
   * 남은 수량 3 으로 수정 → 저장 → 인라인 성공 메시지 + 갱신된 수량 반영.
   *
   * X2 결정: 수정은 남은 수량(remainingQuantity) 직접 전송, BE 가 sold 보존·total 갱신.
   * "0=품절" 아님 — 0개 수정은 폼이 거부(≥1 강제). 마감은 별도 '조기 마감' 버튼.
   *
   * form.formState.isValid 사용에 주의: form.reset() 후 onChange 검증으로 갱신됨.
   */
  test('seedClearance → 상세 진입 → 남은 수량 수정 → 변경 저장', async ({
    sellerPage,
    seller,
  }) => {
    // 0. 시드 — products?tab=deal 첫 방문 이전
    const productName = `E2E떨이수정${Date.now()}`
    const productId = await seedProduct(seller.token, seller.store.id, {
      name: productName,
      regularPrice: 5000,
      category: 'ETC',
    })
    const clearanceId = await seedClearance(seller.token, seller.store.id, productId, {
      salePrice: 2000,
      totalQuantity: 5,
      pickupEndAt: kst2100Today(),
    })

    await waitForStoreReady(sellerPage, seller.store.name)

    // 1. 떨이 상세 직접 진입 (SPA 네비 — clearanceId 로 직접 이동)
    //    /products?tab=deal 경유 시: 홈 페이지가 useClearances(storeId) 목록을 이미 [] 로 캐시 →
    //    spaGoto 후 stale cache 때문에 빈 목록 표시. 상세(detail queryKey = ['clearances', id, 'detail'])는
    //    별도 캐시라 첫 요청이 신선하게 시드 데이터를 받아온다.
    await spaGoto(sellerPage, `/clearance/${clearanceId}`)
    await expect(
      sellerPage.getByRole('heading', { name: '마감 할인 상세' }),
    ).toBeVisible()

    // 시드 상품명 표시 확인
    await expect(sellerPage.getByText(productName)).toBeVisible()

    // OPEN 상태 배지 확인 (수정 폼 활성화 조건)
    await expect(sellerPage.getByText('진행중', { exact: true })).toBeVisible()

    // 3. 남은 수량 수정: 5 → 3
    //    form.reset() 으로 사전 입력된 "5" → fill('3') 으로 교체 (onChange 재검증 → isValid:true)
    const remainingInput = sellerPage.getByPlaceholder('남은 수량')
    await expect(remainingInput).toBeVisible()
    await remainingInput.fill('3')

    // 4. 변경 저장 (form.formState.isValid 게이트)
    const saveBtn = sellerPage.getByRole('button', { name: '변경 저장' })
    await expect(saveBtn).toBeEnabled()
    await saveBtn.click()

    // 5. 인라인 성공 메시지 확인
    await expect(sellerPage.getByText('변경 사항을 저장했어요.')).toBeVisible()

    // 6. 갱신된 남은 수량 반영 (query invalidation → refetch → 판매현황 카드)
    //    ClearanceDetailPage 판매현황: <p>{clearance.remainingQty}개</p>
    await expect(
      sellerPage.locator('p').filter({ hasText: /^3개$/ }).first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})

// ── P3-10 떨이 수동 마감 ──────────────────────────────────────────────────────

test.describe('P3-10 떨이 수동 마감', () => {
  /**
   * seedClearance → 떨이 상세 직접 진입 → "마감 할인 조기 마감" 버튼 → ConfirmSheet 확인 →
   * CLOSED 반영 (상태 배지 "마감" + 수정 폼 사라짐 + 마감 사유 문구 출현).
   *
   * ConfirmSheet(Radix Sheet = role=dialog) 사용.
   * closeReason MANUAL → "사장님이 직접 마감했어요." / BE 미반환 시 fallback "마감된 마감 할인이에요."
   */
  test('seedClearance → 상세 진입 → 조기 마감 → CLOSED 반영', async ({
    sellerPage,
    seller,
  }) => {
    // 0. 시드
    const productName = `E2E떨이마감${Date.now()}`
    const productId = await seedProduct(seller.token, seller.store.id, {
      name: productName,
      regularPrice: 5000,
      category: 'ETC',
    })
    const clearanceId = await seedClearance(seller.token, seller.store.id, productId, {
      salePrice: 2000,
      totalQuantity: 5,
      pickupEndAt: kst2100Today(),
    })

    await waitForStoreReady(sellerPage, seller.store.name)

    // 1. 떨이 상세 직접 진입 (SPA 네비 — spaGoto 는 history.pushState + popstate)
    await spaGoto(sellerPage, `/clearance/${clearanceId}`)
    await expect(
      sellerPage.getByRole('heading', { name: '마감 할인 상세' }),
    ).toBeVisible()

    // OPEN 상태 배지 확인
    await expect(sellerPage.getByText('진행중', { exact: true })).toBeVisible()

    // 2. 조기 마감 버튼 클릭 → ConfirmSheet 오픈
    await sellerPage.getByRole('button', { name: '마감 할인 조기 마감' }).click()
    await expect(
      sellerPage.getByText('마감 할인을 지금 마감할까요?'),
    ).toBeVisible()

    // 3. 확인 버튼 클릭 → POST .../close API
    await sellerPage.getByRole('button', { name: '마감 할인 마감' }).click()

    // 4. CLOSED 반영 — Sheet 닫힘 + query invalidation → refetch
    //    sheet 타이틀 사라짐
    await expect(
      sellerPage.getByText('마감 할인을 지금 마감할까요?'),
    ).not.toBeVisible({ timeout: 15_000 })

    // 수정·조기마감 버튼 사라짐 (editable = status === 'OPEN' → false)
    await expect(
      sellerPage.getByRole('button', { name: '변경 저장' }),
    ).not.toBeVisible()
    await expect(
      sellerPage.getByRole('button', { name: '마감 할인 조기 마감' }),
    ).not.toBeVisible()

    // 상태 배지: "진행중" → "마감" (exact: true — "마감 21:00" 등 부분 문자열과 구분)
    await expect(sellerPage.getByText('마감', { exact: true })).toBeVisible()

    // 마감 사유 문구 (MANUAL: "사장님이 직접 마감했어요." / BE null 시 fallback)
    const closedMsg = sellerPage
      .getByText('사장님이 직접 마감했어요.')
      .or(sellerPage.getByText('마감된 마감 할인이에요.'))
    await expect(closedMsg).toBeVisible()
  })
})
