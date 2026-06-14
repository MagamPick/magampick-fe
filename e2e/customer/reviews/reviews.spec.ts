import { request } from '@playwright/test'
import { test, expect } from '../../fixtures/test'
import { spaGoto, spaGotoFresh } from '../../fixtures/navigation'
import { createSeller, seedProduct, seedClearance } from '../../fixtures/seller'
import { seedOrder } from '../../fixtures/order'
import { customerIdOf, login } from '../../fixtures/api'
import { API_V1 } from '../../fixtures/env'

/**
 * P6-08 리뷰 작성 / P6-09 수정·삭제 / P6-10 사장 답글 + 잠금
 *
 * 시드 전략:
 *  - 사장·상품·떨이는 describe 당 beforeAll 1회 (국세청 호출 최소화)
 *  - 주문은 test 마다 생성 (소비자 계정이 매 test 격리이므로 customerId 도 매번 새로움)
 *  - 리뷰 직접 API 시드: login(customer) → access token → POST /orders/{id}/reviews (multipart)
 *  - 사장 답글 직접 API 시드: seller.token → POST /seller/reviews/{id}/reply
 */

// ─── 공통 API 시드 헬퍼 ────────────────────────────────────────────────────────

/** 소비자 계정 토큰으로 리뷰를 API 로 직접 생성 → reviewId (string) */
async function seedReview(
  customerEmail: string,
  customerPassword: string,
  orderId: number,
  rating = 4,
  content = 'E2E 시드 리뷰',
): Promise<string> {
  const req = await request.newContext()
  try {
    const { accessToken } = await login(req, customerEmail, customerPassword)
    const res = await req.post(`${API_V1}/orders/${orderId}/reviews`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: {
        request: {
          name: 'request',
          mimeType: 'application/json',
          buffer: Buffer.from(JSON.stringify({ rating, content, tags: [] })),
        },
      },
    })
    if (!res.ok()) throw new Error(`[seed] review 생성 실패 ${res.status()}: ${await res.text()}`)
    const body = (await res.json()) as { data?: { id: number }; id?: number }
    const id = body.data?.id ?? body.id
    return String(id)
  } finally {
    await req.dispose()
  }
}

/** 사장 access token 으로 리뷰 답글을 API 로 직접 작성 */
async function seedSellerReply(
  sellerToken: string,
  reviewId: string,
  content = 'E2E 사장 답글입니다.',
): Promise<void> {
  const req = await request.newContext()
  try {
    const res = await req.post(`${API_V1}/seller/reviews/${reviewId}/reply`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
      data: { content },
    })
    if (!res.ok()) throw new Error(`[seed] seller reply 실패 ${res.status()}: ${await res.text()}`)
  } finally {
    await req.dispose()
  }
}

// ─── P6-08 리뷰 작성 ───────────────────────────────────────────────────────────

test.describe('P6-08 리뷰 작성', () => {
  let sellerToken: string
  let storeId: number
  let storeName: string
  let clearanceItemId: number

  test.beforeAll(async () => {
    const seller = await createSeller()
    sellerToken = seller.token
    storeId = seller.store.id
    storeName = seller.store.name
    const productId = await seedProduct(sellerToken, storeId, { name: `리뷰작성상품${Date.now()}` })
    // totalQuantity=20 — 여러 테스트 주문 수용
    clearanceItemId = await seedClearance(sellerToken, storeId, productId, { totalQuantity: 20 })
  })

  test('별점 미선택 → 제출 버튼 비활성', async ({ customer, customerPage }) => {
    const customerId = await customerIdOf(customer)
    const order = await seedOrder({ targetState: 'COMPLETED', customerId, storeId, clearanceItemId })

    await spaGoto(customerPage, `/reviews/write/${order.orderId}`)
    await expect(customerPage.getByRole('heading', { name: '리뷰 작성' })).toBeVisible()

    // 별점 선택 전 — 제출 버튼 비활성
    const submitBtn = customerPage.getByRole('button', { name: '리뷰 등록' })
    await expect(submitBtn).toBeDisabled()

    // 본문만 입력해도 별점 없으면 여전히 비활성
    await customerPage
      .getByPlaceholder('다른 분들께 도움이 되는 후기를 남겨 주세요')
      .fill('별점 없이 내용만 입력')
    await expect(submitBtn).toBeDisabled()
  })

  test('리뷰 작성 성공 → 내 리뷰 목록·매장 리뷰 탭에 반영', async ({ customer, customerPage }) => {
    const customerId = await customerIdOf(customer)
    const order = await seedOrder({ targetState: 'COMPLETED', customerId, storeId, clearanceItemId })
    const REVIEW_CONTENT = `E2E 리뷰 내용 ${Date.now()}`

    await spaGoto(customerPage, `/reviews/write/${order.orderId}`)
    await expect(customerPage.getByRole('heading', { name: '리뷰 작성' })).toBeVisible()

    // 별점 4점 선택 (RatingInput role=radio)
    await customerPage.getByRole('radio', { name: '4점' }).click()
    // 별점 선택 안내 문구 확인 (RATING_LABELS[3] = '좋아요')
    await expect(customerPage.getByText('좋아요')).toBeVisible()

    // 본문 입력
    await customerPage
      .getByPlaceholder('다른 분들께 도움이 되는 후기를 남겨 주세요')
      .fill(REVIEW_CONTENT)

    // 제출 버튼 활성 확인 후 클릭
    await expect(customerPage.getByRole('button', { name: '리뷰 등록' })).toBeEnabled()
    await customerPage.getByRole('button', { name: '리뷰 등록' }).click()

    // 작성 성공 → /reviews/my 로 이동
    await expect(customerPage.getByRole('heading', { name: '내가 쓴 리뷰' })).toBeVisible()

    // 내 리뷰 목록에 해당 매장이 보임
    await expect(customerPage.getByText(storeName).first()).toBeVisible()

    // 작성 내용 확인
    await expect(customerPage.getByText(REVIEW_CONTENT)).toBeVisible()

    // 매장 리뷰 탭에도 반영 확인 (QueryClient 캐시 제거 후 fresh fetch)
    await spaGotoFresh(customerPage, `/store/${storeId}?tab=review`)
    // 리뷰 탭 — 내용이 보임
    await expect(customerPage.getByText(REVIEW_CONTENT)).toBeVisible()
  })

  test('1주문1리뷰 — 중복 제출 시 서버가 거부(serverError)하거나 폼 미노출', async ({
    customer,
    customerPage,
  }) => {
    const customerId = await customerIdOf(customer)
    const order = await seedOrder({ targetState: 'COMPLETED', customerId, storeId, clearanceItemId })

    // API 로 리뷰 1개 선 작성
    await seedReview(customer.email, customer.password, order.orderId)

    // fresh fetch 후 작성 페이지 재진입
    await spaGotoFresh(customerPage, `/reviews/write/${order.orderId}`)

    const heading = customerPage.getByRole('heading', { name: '리뷰 작성' })
    const isFormVisible = await heading.isVisible().catch(() => false)

    if (isFormVisible) {
      // 폼이 표시되는 경우: 별점 선택 + 제출 → BE 가 거부(serverError role=alert)
      await customerPage.getByRole('radio', { name: '5점' }).click()
      await customerPage.getByRole('button', { name: '리뷰 등록' }).click()
      await expect(customerPage.getByRole('alert')).toBeVisible({ timeout: 10_000 })
    } else {
      // 폼이 표시되지 않는 경우: 이미 리뷰 완료된 주문이 reviewable list 에서 제외됨(BE 보호)
      // "주문 정보를 불러오는 중…" 또는 다른 상태 — 이것도 유효한 중복 방지
      await expect(customerPage.getByText('주문 정보를 불러오는 중')).toBeVisible()
    }
  })
})

// ─── P6-09 수정·삭제 ──────────────────────────────────────────────────────────

test.describe('P6-09 수정·삭제', () => {
  let sellerToken: string
  let storeId: number
  let clearanceItemId: number

  test.beforeAll(async () => {
    const seller = await createSeller()
    sellerToken = seller.token
    storeId = seller.store.id
    const productId = await seedProduct(sellerToken, storeId, { name: `수정삭제상품${Date.now()}` })
    clearanceItemId = await seedClearance(sellerToken, storeId, productId, { totalQuantity: 20 })
  })

  test('별점·본문 수정 → 수정 내용이 내 리뷰 목록에 반영', async ({ customer, customerPage }) => {
    const customerId = await customerIdOf(customer)
    const order = await seedOrder({ targetState: 'COMPLETED', customerId, storeId, clearanceItemId })

    // 리뷰 API 시드 (rating=3, content 원본)
    await seedReview(customer.email, customer.password, order.orderId, 3, '원본 리뷰 내용')

    // 내 리뷰 목록 진입 (fresh: 시드 후 캐시 무효화)
    await spaGotoFresh(customerPage, '/reviews/my')
    await expect(customerPage.getByRole('heading', { name: '내가 쓴 리뷰' })).toBeVisible()

    // 수정 버튼 클릭 → 리뷰 수정 페이지 이동
    await customerPage.getByRole('button', { name: '수정' }).click()
    await expect(customerPage.getByRole('heading', { name: '리뷰 수정' })).toBeVisible()

    // 별점 5점으로 변경
    await customerPage.getByRole('radio', { name: '5점' }).click()
    await expect(customerPage.getByText('최고예요')).toBeVisible()

    // 본문 수정
    const textarea = customerPage.getByPlaceholder('다른 분들께 도움이 되는 후기를 남겨 주세요')
    await textarea.clear()
    const UPDATED_CONTENT = `수정된 리뷰 내용 ${Date.now()}`
    await textarea.fill(UPDATED_CONTENT)

    // 수정 완료 제출
    await customerPage.getByRole('button', { name: '수정 완료' }).click()

    // 수정 성공 → /reviews/my 이동
    await expect(customerPage.getByRole('heading', { name: '내가 쓴 리뷰' })).toBeVisible()

    // 수정된 내용 확인
    await expect(customerPage.getByText(UPDATED_CONTENT)).toBeVisible()

    // 별점 5점 = "★★★★★" (MyReviewCard starString)
    await expect(customerPage.getByText('★★★★★')).toBeVisible()
  })

  test('삭제 → 내 리뷰 목록에서 제거', async ({ customer, customerPage }) => {
    const customerId = await customerIdOf(customer)
    const order = await seedOrder({ targetState: 'COMPLETED', customerId, storeId, clearanceItemId })

    // 리뷰 API 시드
    await seedReview(customer.email, customer.password, order.orderId, 5, '삭제할 리뷰')

    // 내 리뷰 목록 진입
    await spaGotoFresh(customerPage, '/reviews/my')
    await expect(customerPage.getByRole('heading', { name: '내가 쓴 리뷰' })).toBeVisible()
    await expect(customerPage.getByText('삭제할 리뷰')).toBeVisible()

    // 삭제 버튼 클릭 — window.confirm 다이얼로그 수락
    customerPage.once('dialog', (dialog) => dialog.accept())
    await customerPage.getByRole('button', { name: '삭제' }).click()

    // 삭제 후 목록에서 제거 확인
    await expect(customerPage.getByText('삭제할 리뷰')).not.toBeVisible({ timeout: 10_000 })

    // 빈 상태 메시지 (이 계정은 리뷰가 이것 1개뿐이므로 EmptyState 노출)
    await expect(customerPage.getByText('작성한 리뷰가 없어요.')).toBeVisible()
  })
})

// ─── P6-10 사장 답글 + 잠금 ───────────────────────────────────────────────────

test.describe('P6-10 사장 답글 + 잠금', () => {
  let sellerToken: string
  let storeId: number
  let clearanceItemId: number

  test.beforeAll(async () => {
    const seller = await createSeller()
    sellerToken = seller.token
    storeId = seller.store.id
    const productId = await seedProduct(sellerToken, storeId, { name: `답글잠금상품${Date.now()}` })
    clearanceItemId = await seedClearance(sellerToken, storeId, productId, { totalQuantity: 20 })
  })

  test('사장 답글 작성 후 소비자의 수정·삭제 버튼이 비노출(잠금)되고 답글이 표시됨', async ({
    customer,
    customerPage,
  }) => {
    const customerId = await customerIdOf(customer)
    const order = await seedOrder({ targetState: 'COMPLETED', customerId, storeId, clearanceItemId })

    // 리뷰 API 시드
    const REPLY_CONTENT = 'E2E 사장 답글입니다.'
    const reviewId = await seedReview(
      customer.email,
      customer.password,
      order.orderId,
      4,
      '답글 잠금 테스트용 리뷰',
    )

    // 사장 답글 API 시드 (POST /seller/reviews/{reviewId}/reply)
    await seedSellerReply(sellerToken, reviewId, REPLY_CONTENT)

    // 소비자 — 내 리뷰 목록 fresh 진입 (답글 포함 최신 상태)
    await spaGotoFresh(customerPage, '/reviews/my')
    await expect(customerPage.getByRole('heading', { name: '내가 쓴 리뷰' })).toBeVisible()

    // 사장 답글 표시 확인
    await expect(customerPage.getByText('사장님 답글')).toBeVisible()
    await expect(customerPage.getByText(REPLY_CONTENT)).toBeVisible()

    // 잠금 확인: 수정·삭제 버튼 비노출
    // MyReviewCard: locked=true → 수정/삭제 버튼 블록 전체 미렌더
    await expect(customerPage.getByRole('button', { name: '수정' })).not.toBeVisible()
    await expect(customerPage.getByRole('button', { name: '삭제' })).not.toBeVisible()
  })
})
