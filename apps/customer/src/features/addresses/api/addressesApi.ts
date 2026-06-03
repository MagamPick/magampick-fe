import { ApiError } from '@/shared/lib/apiError'
import {
  ADDRESS_ERROR,
  MAX_ADDRESSES,
  type Address,
  type AddressSearchResult,
  type CreateAddressInput,
  type UpdateAddressInput,
} from '../types'

/**
 * ⚠️ Mock 스텁 — 백엔드 주소 API(BE 완료 NO) + 카카오 로컬(ADR-002)이 아직이라 가짜 응답.
 * 모듈 인메모리 `store` 로 CRUD 를 흉내낸다(세션 내 유지). 비즈니스 규칙(노션 AC)은 여기서 enforce.
 * 연동 PR 에서 각 함수 본문을 `apiClient` 호출 + Zod 응답 검증으로 교체 — 함수 시그니처는 유지하므로
 * 호출부(훅/컴포넌트)는 그대로 둔다. `SEED`/`store`/검색 풀/`__resetAddressesStoreForTest` 는 그때 제거.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

/** 시드 주소 (연동 시 제거) */
const SEED: Address[] = [
  {
    id: 'ad1',
    label: '우리집',
    roadAddress: '서울 마포구 양화로 23',
    detail: '에덴빌라 101동 1203호',
    latitude: 37.5563,
    longitude: 126.9236,
    isDefault: true,
  },
  {
    id: 'ad2',
    label: '회사',
    roadAddress: '서울 강남구 테헤란로 152',
    detail: '8층',
    latitude: 37.5006,
    longitude: 127.0366,
    isDefault: false,
  },
]

let store: Address[] = clone(SEED)
let seq = SEED.length + 1

/** Mock 검색 결과 풀 (카카오 로컬 대체) */
const SAMPLE_RESULTS: AddressSearchResult[] = [
  { roadAddress: '서울 마포구 와우산로 94', latitude: 37.5512, longitude: 126.9246, zip: '04067' },
  { roadAddress: '서울 마포구 서교동 357-2', latitude: 37.5547, longitude: 126.9203, zip: '04030' },
  { roadAddress: '서울 마포구 독막로 3', latitude: 37.5478, longitude: 126.9223, zip: '04076' },
  { roadAddress: '서울 강남구 테헤란로 152', latitude: 37.5006, longitude: 127.0366, zip: '06236' },
  { roadAddress: '경기 의정부시 민락로 211', latitude: 37.7384, longitude: 127.0807, zip: '11763' },
]

/** Mock GPS 현재 위치 (역지오코딩 결과) */
const MOCK_CURRENT_POSITION: AddressSearchResult = {
  roadAddress: '서울 마포구 양화로 45',
  latitude: 37.5571,
  longitude: 126.925,
}

function findOrThrow(id: string): Address {
  // 실 API 에선 서버가 본인 주소만 반환 → 없거나 타인 주소면 거부 (노션 권한 AC)
  const found = store.find((a) => a.id === id)
  if (!found) throw new ApiError(404, ADDRESS_ERROR.NOT_FOUND, '주소를 찾을 수 없어요')
  return found
}

export const addressesApi = {
  async list(): Promise<Address[]> {
    await delay(200)
    return clone(store)
  },

  async create(input: CreateAddressInput): Promise<Address> {
    await delay(300)
    if (store.length >= MAX_ADDRESSES) {
      throw new ApiError(
        409,
        ADDRESS_ERROR.LIMIT_EXCEEDED,
        `주소는 최대 ${MAX_ADDRESSES}개까지 등록할 수 있어요`,
      )
    }
    if (input.label.length < 1 || input.label.length > 10) {
      throw new ApiError(400, ADDRESS_ERROR.ALIAS_LENGTH, '별칭은 1~10자여야 해요')
    }
    if (!input.roadAddress || !Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
      throw new ApiError(422, ADDRESS_ERROR.GEOCODING_FAILED, '좌표를 확인할 수 없어 등록할 수 없어요')
    }
    const created: Address = {
      id: `ad${seq++}`,
      label: input.label,
      roadAddress: input.roadAddress,
      detail: input.detail ?? '',
      latitude: input.latitude,
      longitude: input.longitude,
      isDefault: store.length === 0, // 첫 주소는 자동 기본
    }
    store.push(created)
    return clone(created)
  },

  async update(id: string, input: UpdateAddressInput): Promise<Address> {
    await delay(300)
    const target = findOrThrow(id)
    if (input.label.length < 1 || input.label.length > 10) {
      throw new ApiError(400, ADDRESS_ERROR.ALIAS_LENGTH, '별칭은 1~10자여야 해요')
    }
    if (!input.roadAddress || !Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
      throw new ApiError(422, ADDRESS_ERROR.GEOCODING_FAILED, '좌표를 확인할 수 없어 저장할 수 없어요')
    }
    // 별칭·상세 + 도로명·좌표 갱신 (노션 2026-05-31: 도로명도 '다시 검색'으로 변경 가능)
    target.label = input.label
    target.detail = input.detail ?? ''
    target.roadAddress = input.roadAddress
    target.latitude = input.latitude
    target.longitude = input.longitude
    return clone(target)
  },

  async remove(id: string): Promise<void> {
    await delay(300)
    const target = findOrThrow(id)
    if (store.length <= 1) {
      throw new ApiError(409, ADDRESS_ERROR.LAST_DELETE_BLOCKED, '최소 1개의 주소는 있어야 해요')
    }
    if (target.isDefault) {
      throw new ApiError(
        409,
        ADDRESS_ERROR.DEFAULT_DELETE_BLOCKED,
        '기본 주소는 삭제할 수 없어요. 다른 주소를 기본으로 먼저 지정해주세요',
      )
    }
    store = store.filter((a) => a.id !== id)
  },

  async setDefault(id: string): Promise<void> {
    await delay(250)
    findOrThrow(id)
    store = store.map((a) => ({ ...a, isDefault: a.id === id }))
  },

  async searchAddress(query: string): Promise<AddressSearchResult[]> {
    await delay(300)
    const q = query.trim()
    if (!q) return []
    const matched = SAMPLE_RESULTS.filter((r) => r.roadAddress.includes(q))
    // 데모용: 검색어가 풀과 안 겹쳐도 빈 화면이 안 되도록 전체 풀을 보여준다 (연동 시 실 결과로 교체)
    return clone(matched.length > 0 ? matched : SAMPLE_RESULTS)
  },

  async reverseGeocodeCurrentPosition(): Promise<AddressSearchResult> {
    await delay(400)
    return clone(MOCK_CURRENT_POSITION)
  },
}

/** 테스트 전용 — `store` 를 시드(또는 주어진 배열)로 리셋. 연동 PR 에서 제거. */
export function __resetAddressesStoreForTest(seed: Address[] = SEED): void {
  store = clone(seed)
  seq = seed.length + 1
}
