import { request } from '@playwright/test'
import { API_V1, COMMON_PASSWORD, MOCK_OTP } from './env'

/**
 * 사장 측 API 시드 헬퍼 — 소비자 deal-presence 테스트(마감임박·떨이 노출)와 wave2 사장 스윗용.
 *
 * dev 는 완료 주문을 API 로 못 만들지만(토스), **매장·상품·떨이(clearance)는 사장 API 로 생성 가능**
 * (seed_phaseA 와 동일 경로). 그래서 "근처에 활성 떨이가 있는 매장"을 즉석 시드해 소비자가 보게 한다.
 *
 * ⚠️ createSeller 는 가입마다 **국세청 실연동**을 호출(공유 사업자번호 N사장 허용). 고병렬 시 burst 스로틀 주의.
 */

const SHARED_BUSINESS_NUMBER = '111-25-30850' // BE 1번호 N사장 허용 (P2-03 UNIQUE 해제)
const SELLER_TERM_IDS = [6, 7, 8, 9]

/** 서경대(성북 서경로) — 소비자 클러스터 A 와 동일 권역이라 근접 노출 보장 */
const DEFAULT_STORE_ADDR = {
  roadAddress: '서울특별시 성북구 서경로 2',
  sigunguCode: '11290',
  roadnameCode: '3107006',
  zonecode: '02712',
} as const

function rand(len: number): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len)
}

function jsonPart(obj: unknown) {
  return { name: 'request.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(obj)) }
}

/** 떨이 픽업 마감 시각(KST 벽시계) — 기본 오늘 21:00, 마감임박 테스트는 kstFromNow(0.5) 사용 */
export function kstFromNow(hours: number): string {
  return new Date(Date.now() + (9 + hours) * 3600 * 1000).toISOString().slice(0, 19)
}
function todayKst2100(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10) + 'T21:00:00'
}

export type SeededSeller = {
  account: { email: string; password: string; ownerName: string; phone: string }
  token: string
  store: { id: number; name: string }
}

/** 사장 1명 + 매장 1개를 API 로 생성(격리). 공유 사업자번호 + OTP mock. */
export async function createSeller(opts?: {
  storeName?: string
  addr?: typeof DEFAULT_STORE_ADDR
}): Promise<SeededSeller> {
  const req = await request.newContext()
  try {
    const phone = `010-7${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`
    const account = {
      email: `qa.e2e.seller-${Date.now().toString(36)}${rand(4)}@magampick.test`,
      password: COMMON_PASSWORD,
      ownerName: `E2E사장${rand(3)}`,
      phone,
    }
    const vtRes = await req.post(`${API_V1}/auth/phone-verifications/confirm`, {
      data: { phone, code: MOCK_OTP },
    })
    if (!vtRes.ok()) throw new Error(`[seed] seller phone-verify 실패 ${vtRes.status()}`)
    const vt = (await vtRes.json()).data.verificationToken

    const addr = opts?.addr ?? DEFAULT_STORE_ADDR
    const storeName = opts?.storeName ?? `E2E매장${rand(5)}`
    const reqObj = {
      email: account.email,
      password: account.password,
      ownerName: account.ownerName,
      phone,
      verificationToken: vt,
      agreedTermIds: SELLER_TERM_IDS,
      store: {
        businessNumber: SHARED_BUSINESS_NUMBER,
        representativeName: account.ownerName,
        openDate: '2024-03-15',
        name: storeName,
        detailAddress: '1층',
        zonecode: addr.zonecode,
        phone: '0299990000',
        description: 'E2E 테스트 매장',
        roadAddress: addr.roadAddress,
        sigunguCode: addr.sigunguCode,
        roadnameCode: addr.roadnameCode,
      },
    }
    const res = await req.post(`${API_V1}/auth/seller/signup`, {
      multipart: { request: jsonPart(reqObj) },
    })
    if (!res.ok()) throw new Error(`[seed] seller signup 실패 ${res.status()}: ${await res.text()}`)
    const token = (await res.json()).data.accessToken

    const storesRes = await req.get(`${API_V1}/seller/stores`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const store = (await storesRes.json()).data[0]

    // 노출 규칙(OPEN AND 오늘 영업요일)을 만족시켜 소비자에게 보이게 — 7일 영업시간 + OPEN 전환
    const auth = { Authorization: `Bearer ${token}` }
    const hours = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(
      (day) => ({ day, openTime: '09:00', closeTime: '22:00' }),
    )
    await req.put(`${API_V1}/seller/stores/${store.id}/business-hours`, {
      headers: auth,
      data: { hours },
    })
    const openRes = await req.patch(`${API_V1}/seller/stores/${store.id}/operation-status`, {
      headers: auth,
      data: { to: 'OPEN' },
    })
    if (!openRes.ok()) throw new Error(`[seed] store OPEN 전환 실패 ${openRes.status()}: ${await openRes.text()}`)

    return { account, token, store: { id: store.id, name: store.name } }
  } finally {
    await req.dispose()
  }
}

/** 사장 매장에 일반 상품 1개 생성(multipart, 이미지 없음) → productId */
export async function seedProduct(
  token: string,
  storeId: number,
  opts?: { name?: string; regularPrice?: number; category?: string },
): Promise<number> {
  const req = await request.newContext()
  try {
    const reqObj = {
      name: opts?.name ?? `상품${rand(5)}`,
      regularPrice: opts?.regularPrice ?? 5000,
      category: opts?.category ?? 'ETC',
    }
    const res = await req.post(`${API_V1}/seller/stores/${storeId}/products`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: { request: jsonPart(reqObj) },
    })
    if (!res.ok()) throw new Error(`[seed] product 실패 ${res.status()}: ${await res.text()}`)
    return (await res.json()).data.id
  } finally {
    await req.dispose()
  }
}

/** 상품을 떨이(clearance)로 등록 → clearanceItemId */
export async function seedClearance(
  token: string,
  storeId: number,
  productId: number,
  opts?: { salePrice?: number; totalQuantity?: number; pickupEndAt?: string },
): Promise<number> {
  const req = await request.newContext()
  try {
    const res = await req.post(`${API_V1}/seller/stores/${storeId}/clearance-items`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        productId,
        salePrice: opts?.salePrice ?? 2000,
        totalQuantity: opts?.totalQuantity ?? 5,
        pickupEndAt: opts?.pickupEndAt ?? todayKst2100(),
      },
    })
    if (!res.ok()) throw new Error(`[seed] clearance 실패 ${res.status()}: ${await res.text()}`)
    return (await res.json()).data.id
  } finally {
    await req.dispose()
  }
}

export type SeededDeal = {
  storeId: number
  storeName: string
  productId: number
  productName: string
  dealId: number
  salePrice: number
  regularPrice: number
}

/** 소비자 근처(서경대)에 활성 떨이 1개를 가진 매장을 즉석 시드 (createSeller+product+clearance 합성) */
export async function seedNearbyDeal(opts?: {
  storeName?: string
  productName?: string
  regularPrice?: number
  salePrice?: number
  pickupEndAt?: string
}): Promise<SeededDeal> {
  const regularPrice = opts?.regularPrice ?? 5000
  const salePrice = opts?.salePrice ?? 2000
  const productName = opts?.productName ?? `떨이상품${rand(4)}`
  const seller = await createSeller({ storeName: opts?.storeName })
  const productId = await seedProduct(seller.token, seller.store.id, { name: productName, regularPrice })
  const dealId = await seedClearance(seller.token, seller.store.id, productId, {
    salePrice,
    pickupEndAt: opts?.pickupEndAt,
  })
  return {
    storeId: seller.store.id,
    storeName: seller.store.name,
    productId,
    productName,
    dealId,
    salePrice,
    regularPrice,
  }
}
