import { describe, it, expect, beforeEach } from 'vitest'
import { addressesApi, __resetAddressesStoreForTest } from './addressesApi'
import { ADDRESS_ERROR, MAX_ADDRESSES, type Address } from '../types'

/** 테스트용 주소 빌더 */
const addr = (over: Partial<Address> = {}): Address => ({
  id: 'a1',
  label: '우리집',
  roadAddress: '서울 마포구 양화로 23',
  detail: '101동 1203호',
  latitude: 37.556,
  longitude: 126.923,
  isDefault: true,
  ...over,
})

/** 유효한 추가 입력 */
const validInput = (over: Partial<Parameters<typeof addressesApi.create>[0]> = {}) => ({
  roadAddress: '서울 마포구 와우산로 94',
  latitude: 37.5512,
  longitude: 126.9246,
  label: '새집',
  detail: '202호',
  ...over,
})

describe('addressesApi (mock)', () => {
  beforeEach(() => __resetAddressesStoreForTest())

  describe('list / 기본 불변식', () => {
    it('주소 목록을 반환하고 기본 주소는 정확히 1개', async () => {
      const list = await addressesApi.list()
      expect(list.length).toBeGreaterThanOrEqual(1)
      expect(list.filter((a) => a.isDefault)).toHaveLength(1)
    })
  })

  describe('create', () => {
    it('추가 성공 시 목록 개수가 1 증가한다', async () => {
      const before = (await addressesApi.list()).length
      const created = await addressesApi.create(validInput())
      expect(created.id).toBeTruthy()
      expect((await addressesApi.list()).length).toBe(before + 1)
    })

    it('첫 주소(빈 목록에서 추가)는 자동으로 기본이 된다', async () => {
      __resetAddressesStoreForTest([])
      const created = await addressesApi.create(validInput())
      expect(created.isDefault).toBe(true)
    })

    it('이미 주소가 있으면 새 주소는 기본이 아니다', async () => {
      const created = await addressesApi.create(validInput())
      expect(created.isDefault).toBe(false)
    })

    it('최대 3개 초과(4개째)면 ADDRESS_LIMIT_EXCEEDED', async () => {
      __resetAddressesStoreForTest([
        addr({ id: 'a1', isDefault: true }),
        addr({ id: 'a2', isDefault: false }),
        addr({ id: 'a3', isDefault: false }),
      ])
      expect((await addressesApi.list()).length).toBe(MAX_ADDRESSES)
      await expect(addressesApi.create(validInput())).rejects.toMatchObject({
        code: ADDRESS_ERROR.LIMIT_EXCEEDED,
      })
    })

    it('별칭이 10자 초과면 ALIAS_LENGTH', async () => {
      await expect(
        addressesApi.create(validInput({ label: '12345678901' })),
      ).rejects.toMatchObject({ code: ADDRESS_ERROR.ALIAS_LENGTH })
    })

    it('별칭이 비어있으면 ALIAS_LENGTH', async () => {
      await expect(addressesApi.create(validInput({ label: '' }))).rejects.toMatchObject({
        code: ADDRESS_ERROR.ALIAS_LENGTH,
      })
    })

    it('좌표가 없으면 GEOCODING_FAILED', async () => {
      await expect(
        addressesApi.create(validInput({ latitude: Number.NaN, longitude: Number.NaN })),
      ).rejects.toMatchObject({ code: ADDRESS_ERROR.GEOCODING_FAILED })
    })
  })

  describe('setDefault', () => {
    it('다른 주소를 기본으로 선택하면 기존 기본은 즉시 해제되어 항상 1개만 기본', async () => {
      const list = await addressesApi.list()
      const nonDefault = list.find((a) => !a.isDefault)!
      await addressesApi.setDefault(nonDefault.id)
      const after = await addressesApi.list()
      expect(after.filter((a) => a.isDefault)).toHaveLength(1)
      expect(after.find((a) => a.id === nonDefault.id)!.isDefault).toBe(true)
    })
  })

  describe('update', () => {
    it('별칭·상세·도로명·좌표를 변경한다 (노션 2026-05-31: 도로명 수정 허용)', async () => {
      const target = (await addressesApi.list()).find((a) => !a.isDefault)!
      const updated = await addressesApi.update(target.id, {
        roadAddress: '서울 종로구 세종대로 1',
        latitude: 37.5717,
        longitude: 126.9769,
        label: '직장',
        detail: '9층',
      })
      expect(updated.label).toBe('직장')
      expect(updated.detail).toBe('9층')
      expect(updated.roadAddress).toBe('서울 종로구 세종대로 1')
      expect(updated.latitude).toBe(37.5717)
    })

    it('없는 주소 수정은 ADDRESS_NOT_FOUND', async () => {
      await expect(
        addressesApi.update('nope', {
          roadAddress: '서울 종로구 세종대로 1',
          latitude: 37.5717,
          longitude: 126.9769,
          label: '집',
          detail: '',
        }),
      ).rejects.toMatchObject({ code: ADDRESS_ERROR.NOT_FOUND })
    })
  })

  describe('remove', () => {
    it('기본 주소 삭제는 DEFAULT_ADDRESS_DELETE_BLOCKED', async () => {
      const def = (await addressesApi.list()).find((a) => a.isDefault)!
      await expect(addressesApi.remove(def.id)).rejects.toMatchObject({
        code: ADDRESS_ERROR.DEFAULT_DELETE_BLOCKED,
      })
    })

    it('기본이 아닌 주소는 삭제되어 개수가 1 감소', async () => {
      const before = await addressesApi.list()
      const nonDefault = before.find((a) => !a.isDefault)!
      await addressesApi.remove(nonDefault.id)
      const after = await addressesApi.list()
      expect(after.length).toBe(before.length - 1)
      expect(after.find((a) => a.id === nonDefault.id)).toBeUndefined()
    })

    it('마지막 1개 주소 삭제는 LAST_ADDRESS_DELETE_BLOCKED', async () => {
      __resetAddressesStoreForTest([addr({ id: 'only', isDefault: true })])
      await expect(addressesApi.remove('only')).rejects.toMatchObject({
        code: ADDRESS_ERROR.LAST_DELETE_BLOCKED,
      })
    })
  })

  describe('searchAddress / reverseGeocodeCurrentPosition', () => {
    it('검색어가 있으면 좌표 포함 결과를 반환한다', async () => {
      const results = await addressesApi.searchAddress('마포')
      expect(results.length).toBeGreaterThan(0)
      expect(Number.isFinite(results[0].latitude)).toBe(true)
      expect(Number.isFinite(results[0].longitude)).toBe(true)
    })

    it('빈 검색어는 빈 배열', async () => {
      expect(await addressesApi.searchAddress('   ')).toEqual([])
    })

    it('현재 위치 역지오코딩은 도로명+좌표를 반환한다', async () => {
      const pos = await addressesApi.reverseGeocodeCurrentPosition()
      expect(pos.roadAddress).toBeTruthy()
      expect(Number.isFinite(pos.latitude)).toBe(true)
      expect(Number.isFinite(pos.longitude)).toBe(true)
    })
  })
})
