import { ApiError } from '@/shared/lib/apiError'
import { PRODUCT_CATEGORIES } from '../types'
import type { CreateProductPayload, Product } from '../types'

/**
 * ⚠️ Mock 스텁 — 일반 상품 BE(BE 완료 NO) 미구현. in-memory 로 상태 유지.
 * 실연동 시 `apiClient` 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 사진은 실연동 시 OCI 업로드 — mock 은 dataURL 을 그대로 저장하고 업로드 항상 성공.
 * 권한(본인 소유 매장만)은 BE/연동 책임 — mock 은 단일 사장 가정.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** 데모 시드: s1(역삼점)에 일반 상품 4종(등록 오래된→최신순), s2(강남점)는 0개(빈 상태 확인용) */
function seed(): Product[] {
  return [
    { id: 'p1', storeId: 's1', name: '통밀 식빵', category: '베이커리', price: 4800, onSale: true },
    { id: 'p2', storeId: 's1', name: '아메리카노', category: '음료', price: 3000, onSale: true },
    { id: 'p3', storeId: 's1', name: '카페라떼', category: '음료', price: 4000, onSale: false },
    {
      id: 'p4',
      storeId: 's1',
      name: '초코 브라우니',
      category: '디저트',
      price: 4500,
      onSale: true,
    },
  ]
}

let products: Product[] = seed()
let seq = 100

/** 테스트 전용 — 모듈 in-memory 상태 초기화 */
export function resetProductState() {
  products = seed()
  seq = 100
}

export const productApi = {
  /** 매장 상품 목록 — 등록 최신순(신규가 상단). soft delete 는 수정/삭제 기능 소관 */
  async listProducts(storeId: string): Promise<Product[]> {
    await delay(300)
    return products
      .filter((p) => p.storeId === storeId)
      .reverse()
      .map((p) => ({ ...p }))
  },

  /** 상품 등록 — 서버측 미러 검증 후 row 생성 (수량 없음, 자동 승인) */
  async createProduct(payload: CreateProductPayload): Promise<Product> {
    await delay(400)

    const name = payload.name.trim()
    if (!name) {
      throw new ApiError(422, 'PRODUCT_INVALID_NAME', '상품명을 입력해 주세요')
    }
    if (!PRODUCT_CATEGORIES.includes(payload.category)) {
      throw new ApiError(422, 'PRODUCT_INVALID_CATEGORY', '카테고리를 선택해 주세요')
    }
    if (!Number.isInteger(payload.price) || payload.price < 0) {
      throw new ApiError(422, 'PRODUCT_INVALID_PRICE', '정상가는 0 이상의 정수여야 해요')
    }

    const product: Product = {
      id: `p${seq++}`,
      storeId: payload.storeId,
      name,
      category: payload.category,
      price: payload.price,
      description: payload.description?.trim() || undefined,
      onSale: payload.onSale,
      imageUrl: payload.imageDataUrl,
    }
    products.push(product)
    return { ...product }
  },
}
