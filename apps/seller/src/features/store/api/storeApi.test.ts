/**
 * storeApi 단위 테스트
 *
 * - 실연동 함수 (getStores / getStoreStatus / transitionStatus / getBusinessHours / saveBusinessHours):
 *   vi.mock('@/shared/lib/axios')로 apiClient를 목킹하고 응답 shape를 검증
 * - Mock 함수 (checkBusinessNumber / createStore / getStore / updateStore):
 *   in-memory 상태로 직접 호출 (resetStoreState 사용)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { storeApi, resetStoreState } from './storeApi'
import { WEEKDAY_ORDER } from '../types'

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

  it('STORE_CLOSED_TODAY(409) BE 에러 — normalizeError가 surface (FE mock 제거)', async () => {
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

// ── Mock 함수 테스트 (Step 2 유지) ────────────────────────────────────────────

const validStoreInput = {
  representativeName: '김사장',
  businessNumber: '123-45-67890',
  openDate: '2020-03-02',
  storeName: '마감픽 베이커리 신촌점',
  storeAddress: '서울 마포구 신촌로 123',
  storeAddressDetail: '1층',
  storePhone: '02-1234-5678',
  photoAdded: true,
}

describe('storeApi.checkBusinessNumber — 사업자 진위확인 (mock)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStoreState()
  })

  it('정상 사업자번호(000 시작 아님) + 대표자명 + 개업일자 → verified', async () => {
    const res = await storeApi.checkBusinessNumber({
      businessNumber: '123-45-67890',
      representativeName: '김사장',
      openDate: '2020-03-02',
    })
    expect(res.verified).toBe(true)
  })

  it('앞 3자리 000 이면 조회 실패 (BUSINESS_NUMBER_INVALID)', async () => {
    await expect(
      storeApi.checkBusinessNumber({
        businessNumber: '000-45-67890',
        representativeName: '김사장',
        openDate: '2020-03-02',
      }),
    ).rejects.toMatchObject({ code: 'BUSINESS_NUMBER_INVALID' })
  })

  it('대표자명·개업일자 누락 시 거부 (INVALID_INPUT)', async () => {
    await expect(
      storeApi.checkBusinessNumber({
        businessNumber: '123-45-67890',
        representativeName: '',
        openDate: '',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' })
  })
})

describe('storeApi.createStore — 매장 등록 (mock, Step 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStoreState()
  })

  it('등록 성공 시 CLOSED_TODAY 새 매장을 반환 (id는 number)', async () => {
    const created = await storeApi.createStore(validStoreInput)
    expect(typeof created.id).toBe('number')
    expect(created.operationStatus).toBe('CLOSED_TODAY')
    expect(created.name).toBe(validStoreInput.storeName)
  })

  it('동일 사업자번호로 매장이 이미 있어도 등록 허용 (UNIQUE 없음)', async () => {
    await storeApi.createStore(validStoreInput)
    await storeApi.createStore(validStoreInput)
    // 시드 2개 + 등록 2개 = 4개는 getStores가 BE 실연동이므로 검증 불가 — 직접 createStore 결과만 확인
    const created = await storeApi.createStore(validStoreInput)
    expect(typeof created.id).toBe('number')
  })

  it('사업자번호가 10자리가 아니면 거부 (BUSINESS_NUMBER_FORMAT_INVALID)', async () => {
    await expect(
      storeApi.createStore({ ...validStoreInput, businessNumber: '123-45' }),
    ).rejects.toMatchObject({ code: 'BUSINESS_NUMBER_FORMAT_INVALID' })
  })
})

describe('storeApi.getStore — 매장 상세 (mock, Step 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStoreState()
  })

  it('역삼점(1) 상세 — 매장명·주소·전화·사진 반환 (id는 number)', async () => {
    const d = await storeApi.getStore(1)
    expect(d).toMatchObject({ id: 1, storeName: '마감픽 베이커리 역삼점', photoAdded: true })
    expect(d.storeAddress).toBeTruthy()
    expect(d.storePhone).toBeTruthy()
  })

  it('없는 매장 id 는 STORE_NOT_FOUND 거부', async () => {
    await expect(storeApi.getStore(999)).rejects.toMatchObject({ code: 'STORE_NOT_FOUND' })
  })
})

describe('storeApi.updateStore — 매장 정보 수정 (mock, Step 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStoreState()
  })

  it('수정 후 getStore 가 새 값을 반환 (즉시 반영)', async () => {
    const updated = await storeApi.updateStore({
      storeId: 1,
      storeName: '마감픽 베이커리 역삼본점',
      storeAddress: '서울 강남구 테헤란로 152',
      storeAddressDetail: '2층',
      storePhone: '02-9999-0000',
      photoAdded: true,
    })
    expect(updated.storeName).toBe('마감픽 베이커리 역삼본점')

    const reread = await storeApi.getStore(1)
    expect(reread.storeName).toBe('마감픽 베이커리 역삼본점')
    expect(reread.storeAddress).toBe('서울 강남구 테헤란로 152')
    expect(reread.storePhone).toBe('02-9999-0000')
  })

  it('없는 매장 id 는 STORE_NOT_FOUND 거부', async () => {
    await expect(
      storeApi.updateStore({
        storeId: 999,
        storeName: 'x',
        storeAddress: 'y',
        storePhone: 'z',
      }),
    ).rejects.toMatchObject({ code: 'STORE_NOT_FOUND' })
  })
})

describe('storeApi.createStore → getStore 정보 영속화 (mock)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStoreState()
  })

  it('등록한 매장도 getStore 로 주소·전화가 조회된다 (미리채움 가능)', async () => {
    const created = await storeApi.createStore(validStoreInput)
    const d = await storeApi.getStore(created.id)
    expect(d.storeName).toBe(validStoreInput.storeName)
    expect(d.storeAddress).toBe(validStoreInput.storeAddress)
    expect(d.storePhone).toBe(validStoreInput.storePhone)
  })
})
