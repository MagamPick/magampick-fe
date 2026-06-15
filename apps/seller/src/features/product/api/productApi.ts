/**
 * 일반 상품 도메인 API — 실연동 (multipart/form-data for create/update).
 * 참조 패턴: storeApi.ts (createStore/updateStore — 같은 multipart 구성).
 * 에러 정규화: apiClient interceptor(normalizeError) 가 처리.
 */
import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { nullish, nullableString, nullableNumber } from '@/shared/lib/zodNullable'
import { productCategorySchema } from '../types'
import type { CreateProductPayload, Product, UpdateProductPayload } from '../types'

// ─── BE 응답 Zod 스키마 ────────────────────────────────────────────────────────

/** ProductResponse (BE spec) */
const productResponseSchema = z.object({
  id: z.number(),
  name: nullableString(),
  regularPrice: nullableNumber(),
  // BE 가 imageUrl 을 null 로 내려줄 수 있어 nullish 로 수용 (소비자 앱 패턴 미러)
  imageUrl: z.string().nullish(),
  status: nullish(z.enum(['ON_SALE', 'SOLD_OUT'])),
  category: nullish(productCategorySchema),
  description: nullableString(),
  createdAt: nullableString(),
  // storeId 는 BE 응답에 없음 — 호출 측 storeId 로 채움
})

/** PageResponseProductResponse (목록) */
const pageProductResponseSchema = z.object({
  content: nullish(z.array(productResponseSchema)),
  // page/size/totalCount 는 FE에서 미사용 (100개 단일 페이지 전략)
})

// ─── BE 응답 → FE 도메인 매핑 ──────────────────────────────────────────────────

function toProduct(raw: z.infer<typeof productResponseSchema>, storeId: number): Product {
  return {
    id: raw.id,
    storeId,
    name: raw.name ?? '',
    category: raw.category ?? 'ETC',
    price: raw.regularPrice ?? 0,
    description: raw.description || undefined,
    onSale: raw.status !== 'SOLD_OUT',
    imageUrl: raw.imageUrl ?? undefined,
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const productApi = {
  /**
   * GET /seller/stores/{storeId}/products?page=0&size=100&sort=createdAt,desc
   * pageable 쿼리를 평면 params 로 전달 → content[] 언랩.
   */
  async listProducts(storeId: number): Promise<Product[]> {
    const res = await apiClient.get(`/seller/stores/${storeId}/products`, {
      params: { page: 0, size: 100, sort: 'createdAt,desc' },
    })
    const parsed = pageProductResponseSchema.parse(res.data)
    return (parsed.content ?? []).map((p) => toProduct(p, storeId))
  },

  /** GET /seller/stores/{storeId}/products/{productId} */
  async getProduct(storeId: number, id: number): Promise<Product> {
    const res = await apiClient.get(`/seller/stores/${storeId}/products/${id}`)
    return toProduct(productResponseSchema.parse(res.data), storeId)
  },

  /**
   * POST /seller/stores/{storeId}/products — multipart/form-data.
   * `request` JSON 파트(ProductCreateRequest) + 선택 `image` File 파트.
   * 409 상품명 중복: apiClient interceptor가 ApiError로 surface.
   */
  async createProduct(storeId: number, payload: Omit<CreateProductPayload, 'storeId'>): Promise<Product> {
    const { imageFile, ...fields } = payload
    const requestBody = {
      name: fields.name,
      regularPrice: fields.price,
      category: fields.category,
      description: fields.description || undefined,
      status: fields.onSale ? 'ON_SALE' : 'SOLD_OUT',
    }
    const form = new FormData()
    form.append('request', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }))
    if (imageFile) {
      form.append('image', imageFile)
    }
    const res = await apiClient.post(`/seller/stores/${storeId}/products`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return toProduct(productResponseSchema.parse(res.data), storeId)
  },

  /**
   * PATCH /seller/stores/{storeId}/products/{productId} — multipart/form-data.
   * null 필드는 변경 없음(BE spec).
   */
  async updateProduct(storeId: number, id: number, payload: UpdateProductPayload): Promise<Product> {
    const { imageFile, ...fields } = payload
    const requestBody = {
      name: fields.name,
      regularPrice: fields.price,
      category: fields.category,
      description: fields.description || undefined,
      status: fields.onSale ? 'ON_SALE' : 'SOLD_OUT',
    }
    const form = new FormData()
    form.append('request', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }))
    if (imageFile) {
      form.append('image', imageFile)
    }
    const res = await apiClient.patch(`/seller/stores/${storeId}/products/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return toProduct(productResponseSchema.parse(res.data), storeId)
  },

  /**
   * DELETE /seller/stores/{storeId}/products/{productId} — soft delete.
   * 진행 중(OPEN) 떨이가 있으면 BE가 409("진행 중인 떨이 존재")로 차단. cascade 마감 없음.
   */
  async deleteProduct(storeId: number, id: number): Promise<void> {
    await apiClient.delete(`/seller/stores/${storeId}/products/${id}`)
  },
}
