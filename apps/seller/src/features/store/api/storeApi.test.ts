/**
 * storeApi 단위 테스트
 *
 * 모든 함수 실연동 (Step 2 완료):
 * vi.mock('@/shared/lib/axios')로 apiClient를 목킹하고 엔드포인트·Zod·매핑을 검증.
 *
 * checkBusinessNumber: 204 void
 * createStore: multipart POST → StoreRegisterResponse → StoreSummary
 * getStore: GET → StoreDetailResponse → StoreDetail
 * updateStore: multipart PATCH → StoreDetailResponse → StoreDetail
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { storeApi } from './storeApi'
import { WEEKDAY_ORDER } from '../types'
import type { CreateStoreInput, UpdateStoreInput } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}))

// ── 실연동 함수 테스트 ──────────────────────────────────────────────────────────

describe('storeApi.getStores — BE 실연동', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /seller/stores 호출 + StoreResponse[] → StoreSummary[] 매핑', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [
        { id: 1, name: '마감픽 베이커리 역삼점', operationStatus: 'OPEN' },
        { id: 2, name: '마감픽 베이커리 강남점', operationStatus: 'CLOSED_TODAY' },
      ],
    })
    const stores = await storeApi.getStores()
    expect(apiClient.get).toHaveBeenCalledWith('/seller/stores')
    expect(stores).toEqual([
      { id: 1, name: '마감픽 베이커리 역삼점', operationStatus: 'OPEN' },
      { id: 2, name: '마감픽 베이커리 강남점', operationStatus: 'CLOSED_TODAY' },
    ])
  })

  it('BE 응답에 필수 필드(id/name/operationStatus) 없으면 Zod parse 실패(runtime 게이트)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [{ id: 1 }] }) // name/operationStatus 누락
    await expect(storeApi.getStores()).rejects.toBeTruthy()
  })
})

describe('storeApi.getStoreStatus — BE 실연동', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /seller/stores/1/operation-status 호출 + OperationStatusResponse → StoreStatus 매핑', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { storeId: 1, operationStatus: 'OPEN', canOpenToday: true, todayCloseTime: '21:00' },
    })
    const status = await storeApi.getStoreStatus(1)
    expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/operation-status')
    expect(status).toEqual({
      storeId: 1,
      operationStatus: 'OPEN',
      canOpenToday: true,
      todayCloseTime: '21:00',
    })
  })

  it('todayCloseTime HH:mm:ss 형식이 와도 HH:mm으로 자름 (방어적 slice)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { storeId: 2, operationStatus: 'CLOSED_TODAY', canOpenToday: false, todayCloseTime: '21:00:00' },
    })
    const status = await storeApi.getStoreStatus(2)
    expect(status.todayCloseTime).toBe('21:00')
  })

  it('todayCloseTime 없으면 undefined', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { storeId: 2, operationStatus: 'CLOSED_TODAY', canOpenToday: false },
    })
    const status = await storeApi.getStoreStatus(2)
    expect(status.todayCloseTime).toBeUndefined()
  })
})

describe('storeApi.transitionStatus — BE 실연동', () => {
  beforeEach(() => vi.clearAllMocks())

  it('PATCH /seller/stores/1/operation-status {to: BREAK} 호출 + 응답 매핑', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { storeId: 1, operationStatus: 'BREAK', canOpenToday: true, todayCloseTime: '21:00' },
    })
    const status = await storeApi.transitionStatus({ storeId: 1, to: 'BREAK' })
    expect(apiClient.patch).toHaveBeenCalledWith('/seller/stores/1/operation-status', { to: 'BREAK' })
    expect(status.operationStatus).toBe('BREAK')
  })

  it('STORE_CLOSED_TODAY(409) BE 에러 — normalizeError가 surface', async () => {
    const err = { status: 409, code: 'STORE_CLOSED_TODAY', message: '오늘은 영업 요일이 아니에요' }
    vi.mocked(apiClient.patch).mockRejectedValue(err)
    await expect(storeApi.transitionStatus({ storeId: 2, to: 'OPEN' })).rejects.toBeTruthy()
  })
})

describe('storeApi.getBusinessHours — BE 실연동', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /seller/stores/1/business-hours 호출 + BusinessHourPayload[] → BusinessHour[] 매핑(요일 변환)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [
        { day: 'MONDAY', openTime: '09:00', closeTime: '21:00' },
        { day: 'TUESDAY', openTime: '09:00', closeTime: '21:00' },
      ],
    })
    const hours = await storeApi.getBusinessHours(1)
    expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/business-hours')
    expect(hours).toEqual([
      { day: 'mon', openTime: '09:00', closeTime: '21:00' },
      { day: 'tue', openTime: '09:00', closeTime: '21:00' },
    ])
  })

  it('빈 배열 반환 허용', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
    const hours = await storeApi.getBusinessHours(2)
    expect(hours).toEqual([])
  })

  it('시각 HH:mm:ss 형식이 와도 HH:mm으로 자름', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [{ day: 'MONDAY', openTime: '09:00:00', closeTime: '21:00:00' }],
    })
    const hours = await storeApi.getBusinessHours(1)
    expect(hours[0]?.openTime).toBe('09:00')
    expect(hours[0]?.closeTime).toBe('21:00')
  })
})

describe('storeApi.saveBusinessHours — BE 실연동', () => {
  beforeEach(() => vi.clearAllMocks())

  it('PUT /seller/stores/1/business-hours {hours: BE형식} 호출 + 응답 매핑', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      data: [{ day: 'MONDAY', openTime: '10:00', closeTime: '18:00' }],
    })
    const result = await storeApi.saveBusinessHours({
      storeId: 1,
      hours: [{ day: 'mon', openTime: '10:00', closeTime: '18:00' }],
    })
    expect(apiClient.put).toHaveBeenCalledWith('/seller/stores/1/business-hours', {
      hours: [{ day: 'MONDAY', openTime: '10:00', closeTime: '18:00' }],
    })
    expect(result).toEqual([{ day: 'mon', openTime: '10:00', closeTime: '18:00' }])
  })

  it('FE 요일(mon..sun) → BE 요일(MONDAY..SUNDAY) 변환 검증', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      data: WEEKDAY_ORDER.map((_, i) => ({
        day: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'][i],
        openTime: '09:00',
        closeTime: '21:00',
      })),
    })
    await storeApi.saveBusinessHours({
      storeId: 1,
      hours: WEEKDAY_ORDER.map((day) => ({ day, openTime: '09:00', closeTime: '21:00' })),
    })
    const sent = vi.mocked(apiClient.put).mock.calls[0]?.[1] as { hours: { day: string }[] }
    expect(sent.hours[0]?.day).toBe('MONDAY')
    expect(sent.hours[6]?.day).toBe('SUNDAY')
  })
})

// ── Step 2 실연동 함수 테스트 ──────────────────────────────────────────────────

const baseStoreDetailData = {
  id: 1,
  name: '마감픽 베이커리 역삼점',
  roadAddress: '서울 강남구 역삼로 180',
  zonecode: '06242',
  phone: '02-501-1234',
  businessNumber: '123-45-67890',
}

describe('storeApi.checkBusinessNumber — BE 실연동 (204 void)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('POST /seller/stores/business-verification 호출 → 204 void 반환', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null, status: 204 })
    await expect(
      storeApi.checkBusinessNumber({
        businessNumber: '123-45-67890',
        representativeName: '김사장',
        openDate: '2020-03-02',
      }),
    ).resolves.toBeUndefined()
    expect(apiClient.post).toHaveBeenCalledWith('/seller/stores/business-verification', {
      businessNumber: '123-45-67890',
      representativeName: '김사장',
      openDate: '2020-03-02',
    })
  })

  it('BUSINESS_INFO_MISMATCH(400) 시 BE 에러가 surface 됨', async () => {
    vi.mocked(apiClient.post).mockRejectedValue({ status: 400, code: 'BUSINESS_INFO_MISMATCH' })
    await expect(
      storeApi.checkBusinessNumber({
        businessNumber: '000-00-00000',
        representativeName: '잘못된사장',
        openDate: '2020-01-01',
      }),
    ).rejects.toBeTruthy()
  })
})

describe('storeApi.createStore — BE 실연동 (multipart POST)', () => {
  beforeEach(() => vi.clearAllMocks())

  const input: CreateStoreInput = {
    businessNumber: '123-45-67890',
    representativeName: '김사장',
    openDate: '2020-03-02',
    name: '마감픽 베이커리 신촌점',
    roadAddress: '서울 마포구 신촌로 123',
    zonecode: '04101',
    phone: '02-1234-5678',
    sigunguCode: '11440',
    roadnameCode: '1234567',
  }

  it('POST /seller/stores multipart 호출 → StoreRegisterResponse → StoreSummary 매핑', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { storeId: 3, operationStatus: 'CLOSED_TODAY' },
    })
    const result = await storeApi.createStore(input)

    // 엔드포인트·multipart 검증
    const [path, formData, config] = vi.mocked(apiClient.post).mock.calls[0]!
    expect(path).toBe('/seller/stores')
    expect(formData).toBeInstanceOf(FormData)
    expect((config as { headers: Record<string, string> })?.headers?.['Content-Type']).toBe(
      'multipart/form-data',
    )
    expect((formData as FormData).has('request')).toBe(true)
    expect((formData as FormData).has('image')).toBe(false) // imageFile 없음

    // 응답 매핑: name은 제출한 input.name 으로 구성 (응답에 name 없음)
    expect(result).toEqual({
      id: 3,
      name: input.name,
      operationStatus: 'CLOSED_TODAY',
    })
  })

  it('imageFile 있을 때 FormData에 image 파트 포함', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { storeId: 4, operationStatus: 'CLOSED_TODAY' },
    })
    const imageFile = new File(['img'], 'store.png', { type: 'image/png' })
    await storeApi.createStore({ ...input, imageFile })

    const [, formData] = vi.mocked(apiClient.post).mock.calls[0]!
    expect((formData as FormData).has('image')).toBe(true)
  })

  it('BE 응답 storeId 누락 시 Zod parse 실패 (runtime 게이트)', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { operationStatus: 'CLOSED_TODAY' } })
    await expect(storeApi.createStore(input)).rejects.toBeTruthy()
  })
})

describe('storeApi.getStore — BE 실연동', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /seller/stores/1 호출 → StoreDetailResponse → StoreDetail 매핑', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: baseStoreDetailData })
    const detail = await storeApi.getStore(1)
    expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1')
    expect(detail).toMatchObject({
      id: 1,
      name: '마감픽 베이커리 역삼점',
      roadAddress: '서울 강남구 역삼로 180',
      zonecode: '06242',
      phone: '02-501-1234',
    })
  })

  it('선택 필드(jibunAddress/detailAddress/imageUrl) 없으면 undefined', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: baseStoreDetailData })
    const detail = await storeApi.getStore(1)
    expect(detail.jibunAddress).toBeUndefined()
    expect(detail.detailAddress).toBeUndefined()
    expect(detail.imageUrl).toBeUndefined()
  })

  it('imageUrl 이 null 이어도 throw 없이 undefined 로 정규화한다 (BE imageUrl: null)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { ...baseStoreDetailData, imageUrl: null },
    })
    const detail = await storeApi.getStore(1)
    expect(detail.imageUrl).toBeUndefined()
  })

  it('선택 필드 있을 때 StoreDetail 에 포함', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        ...baseStoreDetailData,
        jibunAddress: '서울 강남구 역삼동 123',
        detailAddress: '1층',
        imageUrl: 'https://example.com/store.jpg',
      },
    })
    const detail = await storeApi.getStore(1)
    expect(detail.jibunAddress).toBe('서울 강남구 역삼동 123')
    expect(detail.detailAddress).toBe('1층')
    expect(detail.imageUrl).toBe('https://example.com/store.jpg')
  })

  it('BE 응답 name 누락 시 Zod parse 실패 (runtime 게이트)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { id: 1, roadAddress: '서울 강남구 역삼로 180', zonecode: '06242', phone: '02-501-1234' },
    })
    await expect(storeApi.getStore(1)).rejects.toBeTruthy()
  })
})

describe('storeApi.updateStore — BE 실연동 (multipart PATCH)', () => {
  beforeEach(() => vi.clearAllMocks())

  const input: UpdateStoreInput = { storeId: 1, name: '역삼본점', phone: '02-9999-0000' }

  it('PATCH /seller/stores/1 multipart 호출 → StoreDetailResponse → StoreDetail 매핑', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { ...baseStoreDetailData, name: '역삼본점', phone: '02-9999-0000' },
    })
    const result = await storeApi.updateStore(input)

    const [path, formData, config] = vi.mocked(apiClient.patch).mock.calls[0]!
    expect(path).toBe('/seller/stores/1')
    expect(formData).toBeInstanceOf(FormData)
    expect((config as { headers: Record<string, string> })?.headers?.['Content-Type']).toBe(
      'multipart/form-data',
    )
    expect((formData as FormData).has('request')).toBe(true)
    expect(result.name).toBe('역삼본점')
    expect(result.phone).toBe('02-9999-0000')
  })

  it('imageFile 있을 때 FormData에 image 파트 포함', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: baseStoreDetailData })
    const imageFile = new File(['img'], 'store.png', { type: 'image/png' })
    await storeApi.updateStore({ ...input, imageFile })

    const [, formData] = vi.mocked(apiClient.patch).mock.calls[0]!
    expect((formData as FormData).has('image')).toBe(true)
  })

  it('주소 변경 포함 시 roadAddress 등 코드들이 request JSON에 담김', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: baseStoreDetailData })
    await storeApi.updateStore({
      storeId: 1,
      roadAddress: '서울 강남구 테헤란로 152',
      zonecode: '06235',
      sigunguCode: '11680',
      roadnameCode: '3179999',
    })

    const [, formData] = vi.mocked(apiClient.patch).mock.calls[0]!
    // request Blob 에 roadAddress 가 담겼는지 확인
    const requestBlob = (formData as FormData).get('request') as Blob
    const requestText = await requestBlob.text()
    const requestJson = JSON.parse(requestText) as Record<string, unknown>
    expect(requestJson.roadAddress).toBe('서울 강남구 테헤란로 152')
    expect(requestJson.sigunguCode).toBe('11680')
  })
})
