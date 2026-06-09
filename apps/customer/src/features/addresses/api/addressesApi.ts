import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import {
  addressResponseSchema,
  reverseGeocodeResponseSchema,
  type Address,
  type CreateAddressInput,
  type UpdateAddressInput,
} from '../types'

/** BE AddressResponse → 정규화된 Address (detailAddress 없으면 '' 로 채움) */
function toAddress(raw: z.infer<typeof addressResponseSchema>): Address {
  return { ...raw, detailAddress: raw.detailAddress ?? '' }
}

/**
 * 주소지 관리 API (실 BE 연동).
 * - 좌표는 서버가 sigunguCode+roadnameCode 또는 roadAddress 로 지오코딩 (클라이언트 전송 X)
 * - 인증·에러 정규화는 apiClient 인터셉터(Bearer + ApiError) 가 담당
 * - 비즈니스 규칙(개수·삭제 제약 등)은 BE 가 enforce, ApiError 로 수신
 */
export const addressesApi = {
  /** GET /customers/me/addresses → Address[] */
  async list(): Promise<Address[]> {
    const res = await apiClient.get('/customers/me/addresses')
    return z.array(addressResponseSchema).parse(res.data).map(toAddress)
  },

  /** POST /customers/me/addresses → 201 Address */
  async create(input: CreateAddressInput): Promise<Address> {
    const res = await apiClient.post('/customers/me/addresses', input)
    return toAddress(addressResponseSchema.parse(res.data))
  },

  /** PATCH /customers/me/addresses/:id → 200 Address */
  async update(id: number, input: UpdateAddressInput): Promise<Address> {
    const res = await apiClient.patch(`/customers/me/addresses/${id}`, input)
    return toAddress(addressResponseSchema.parse(res.data))
  },

  /** DELETE /customers/me/addresses/:id → 204 void */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/customers/me/addresses/${id}`)
  },

  /** POST /customers/me/addresses/:id/default → 200 (응답 무시, 훅이 invalidate) */
  async setDefault(id: number): Promise<void> {
    await apiClient.post(`/customers/me/addresses/${id}/default`)
  },

  /** POST /customers/me/addresses/reverse-geocode body {latitude,longitude} → {roadAddress} */
  async reverseGeocode(coords: {
    latitude: number
    longitude: number
  }): Promise<{ roadAddress: string }> {
    const res = await apiClient.post('/customers/me/addresses/reverse-geocode', coords)
    return reverseGeocodeResponseSchema.parse(res.data)
  },
}
