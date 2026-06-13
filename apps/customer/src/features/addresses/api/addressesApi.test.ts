import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '@/shared/lib/apiError'

// apiClient 목킹 — axios 인스턴스를 간단한 vi.fn() 객체로 대체
vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/shared/lib/axios'
import { addressesApi } from './addressesApi'

/** BE AddressResponse 픽처 */
const addressFixture = {
  id: 1,
  label: '우리집',
  roadAddress: '서울 마포구 양화로 23',
  detailAddress: '101동 1203호',
  jibunAddress: '서울 마포구 서교동 123-1',
  zonecode: '04031',
  latitude: 37.556,
  longitude: 126.923,
  isDefault: true,
}

describe('addressesApi (실 BE 연동)', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('list', () => {
    it('GET /customers/me/addresses 를 호출하고 id 가 number 인 Address[] 반환', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [addressFixture] })
      const result = await addressesApi.list()
      expect(apiClient.get).toHaveBeenCalledWith('/customers/me/addresses')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
      expect(typeof result[0].id).toBe('number')
    })

    it('detailAddress 없으면 빈 문자열로 정규화', async () => {
      const noDetail = { ...addressFixture, detailAddress: undefined }
      vi.mocked(apiClient.get).mockResolvedValue({ data: [noDetail] })
      const result = await addressesApi.list()
      expect(result[0].detailAddress).toBe('')
    })

    it('jibunAddress 가 null 이어도 throw 없이 undefined 로 정규화 (BE jibunAddress: null)', async () => {
      const nullJibun = { ...addressFixture, jibunAddress: null }
      vi.mocked(apiClient.get).mockResolvedValue({ data: [nullJibun] })
      const result = await addressesApi.list()
      expect(result[0].jibunAddress).toBeUndefined()
    })

    it('isDefault 가 boolean 으로 파싱됨', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [addressFixture] })
      const result = await addressesApi.list()
      expect(typeof result[0].isDefault).toBe('boolean')
    })
  })

  describe('create', () => {
    it('POST /customers/me/addresses 에 sigunguCode·roadnameCode 포함 전송, Address 반환', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ...addressFixture, isDefault: false, id: 2 } })
      const input = {
        label: '새집',
        roadAddress: '서울 마포구 와우산로 94',
        jibunAddress: '서울 마포구 서교동 357-2',
        zonecode: '04067',
        sigunguCode: '11440',
        roadnameCode: '114403003003',
        detailAddress: '202호',
      }
      const result = await addressesApi.create(input)
      expect(apiClient.post).toHaveBeenCalledWith('/customers/me/addresses', input)
      expect(typeof result.id).toBe('number')
    })

    it('GPS 경로: roadAddress + 좌표(latitude/longitude) 전송(코드 미전송), 201 반환', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ...addressFixture, id: 3 } })
      const input = {
        label: '현재위치',
        roadAddress: '서울 마포구 양화로 45',
        latitude: 37.5571,
        longitude: 126.925,
      }
      await addressesApi.create(input)
      expect(apiClient.post).toHaveBeenCalledWith('/customers/me/addresses', input)
    })
  })

  describe('update', () => {
    it('PATCH /customers/me/addresses/:id 호출, 수정된 Address 반환', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: { ...addressFixture, label: '직장' } })
      const input = { label: '직장', detailAddress: '9층' }
      const result = await addressesApi.update(1, input)
      expect(apiClient.patch).toHaveBeenCalledWith('/customers/me/addresses/1', input)
      expect(result.label).toBe('직장')
    })

    it('도로명 변경 수정 시 sigunguCode·roadnameCode 동반', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { ...addressFixture, roadAddress: '서울 종로구 세종대로 1' },
      })
      const input = {
        label: '직장',
        roadAddress: '서울 종로구 세종대로 1',
        sigunguCode: '11110',
        roadnameCode: '111102003001',
      }
      await addressesApi.update(1, input)
      expect(apiClient.patch).toHaveBeenCalledWith('/customers/me/addresses/1', input)
    })
  })

  describe('remove', () => {
    it('DELETE /customers/me/addresses/:id 호출, void 반환 (204 바디 없음)', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined })
      const result = await addressesApi.remove(1)
      expect(apiClient.delete).toHaveBeenCalledWith('/customers/me/addresses/1')
      expect(result).toBeUndefined()
    })
  })

  describe('setDefault', () => {
    it('POST /customers/me/addresses/:id/default 호출', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })
      await addressesApi.setDefault(2)
      expect(apiClient.post).toHaveBeenCalledWith('/customers/me/addresses/2/default')
    })
  })

  describe('reverseGeocode', () => {
    it('POST /customers/me/addresses/reverse-geocode 에 좌표 전송, {roadAddress} 반환', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { roadAddress: '서울 마포구 양화로 45' } })
      const result = await addressesApi.reverseGeocode({ latitude: 37.5571, longitude: 126.925 })
      expect(apiClient.post).toHaveBeenCalledWith('/customers/me/addresses/reverse-geocode', {
        latitude: 37.5571,
        longitude: 126.925,
      })
      expect(result.roadAddress).toBe('서울 마포구 양화로 45')
    })
  })

  describe('에러 전파', () => {
    it('apiClient 에러는 ApiError 로 전파된다 (인터셉터 정규화 결과)', async () => {
      const err = new ApiError(404, 'ADDRESS_NOT_FOUND', '주소를 찾을 수 없어요')
      vi.mocked(apiClient.get).mockRejectedValue(err)
      await expect(addressesApi.list()).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' })
    })

    it('delete 에러도 ApiError 로 전파된다', async () => {
      const err = new ApiError(409, 'DEFAULT_ADDRESS_DELETE_BLOCKED', '기본 주소는 삭제할 수 없어요')
      vi.mocked(apiClient.delete).mockRejectedValue(err)
      await expect(addressesApi.remove(1)).rejects.toMatchObject({
        code: 'DEFAULT_ADDRESS_DELETE_BLOCKED',
      })
    })
  })
})
