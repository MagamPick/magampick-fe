import { ApiError } from '@/shared/lib/apiError'
import { PRODUCT_CATEGORIES } from '../types'
import type { CreateProductPayload, Product, UpdateProductPayload } from '../types'

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

/**
 * 내부 조회(지연 없음) — 떨이 join 등 교차 도메인 mock 합성용. soft delete 제외.
 * UI 는 직접 쓰지 말 것(지연 있는 조회 훅 사용). 실연동 시 제거.
 */
export function peekProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id && !p.deletedAt)
}

export const productApi = {
  /** 매장 상품 목록 — 등록 최신순(신규가 상단). soft delete 제외 */
  async listProducts(storeId: string): Promise<Product[]> {
    await delay(300)
    return products
      .filter((p) => p.storeId === storeId && !p.deletedAt)
      .reverse()
      .map((p) => ({ ...p }))
  },

  /** 상품 단건 조회 (상세·수정 화면). soft delete 제외 */
  async getProduct(id: string): Promise<Product> {
    await delay(300)
    const product = products.find((p) => p.id === id && !p.deletedAt)
    if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없어요')
    return { ...product }
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

  /** 상품 수정 — 등록과 동일 검증. 사진은 imageDataUrl 제공 시에만 교체(미제공 시 기존 유지) */
  async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    await delay(400)
    const product = products.find((p) => p.id === id && !p.deletedAt)
    if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없어요')

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

    product.name = name
    product.category = payload.category
    product.price = payload.price
    product.description = payload.description?.trim() || undefined
    product.onSale = payload.onSale
    if (payload.imageDataUrl !== undefined) product.imageUrl = payload.imageDataUrl
    return { ...product }
  },

  /**
   * 상품 삭제 — soft delete (`deletedAt` 기록). 목록·조회에서 제외, 복원 UI 없음.
   * 진행 중인 떨이 자동 마감은 호출 측(useDeleteProduct)이 clearance 와 함께 처리.
   */
  async deleteProduct(id: string): Promise<void> {
    await delay(400)
    const product = products.find((p) => p.id === id && !p.deletedAt)
    if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없어요')
    product.deletedAt = new Date().toISOString()
  },
}
