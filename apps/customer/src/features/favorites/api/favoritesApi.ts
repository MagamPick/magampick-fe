import { ApiError } from '@/shared/lib/apiError'
import {
  favoriteListSchema,
  FAVORITE_ERROR,
  FAVORITE_LIMIT,
  type FavoriteList,
  type FavoriteStore,
} from '../types'

/**
 * ⚠️ Mock 스텁 — 단골매장 BE(BE 완료 NO)가 아직이라 가짜 응답.
 * 모듈 인메모리 `entries` 로 단골 추가/해제/목록을 흉내낸다(세션 내 유지) — 매장 상세·홈·단골 목록이
 * 공유하는 단일 소스. 비즈니스 규칙(상한 50·idempotent)은 여기서 enforce.
 * 연동 PR 에서 각 함수 본문을 `apiClient` 호출 + Zod 응답 검증으로 교체(시그니처 유지).
 * 거리·별점·정렬·통계는 BE/DB(ADR-003 PostGIS) 책임 — mock 은 "이미 계산·정렬된" 응답을 반환.
 * `SEED`/`entries`/`synthesize`/`__resetFavoritesStoreForTest` 는 그때 제거.
 */

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=320&h=320&fit=crop&q=80&auto=format`

/** 인메모리 단골 항목 = 카드 + 등록 시각(정렬용 단조 증가값) */
type FavoriteEntry = FavoriteStore & { favoritedAt: number }

/**
 * 알려진 매장 카탈로그 (연동 시 제거) — 상세/홈과 id 일치. 카드 없이 add(id) 될 때(매장 상세에서
 * 추가) 올바른 카드를 반환하기 위한 mock "매장 DB". activeDealCount 는 BE 계산 가정값.
 */
const CATALOG: Record<string, FavoriteStore> = {
  'st-1': {
    id: 'st-1',
    name: '베이커리 브레드샵',
    imageUrl: UNSPLASH('photo-1555507036-ab1f4038808a'),
    distanceKm: 0.3,
    rating: 4.8,
    activeDealCount: 3,
  },
  'st-break': {
    id: 'st-break',
    name: '커피로스터스 합정',
    imageUrl: UNSPLASH('photo-1495474472287-4d71bcdd2085'),
    distanceKm: 0.5,
    rating: 4.6,
    activeDealCount: 2,
  },
  'st-closed': {
    id: 'st-closed',
    name: '스윗아워 디저트',
    imageUrl: null,
    distanceKm: 0.8,
    rating: 4.4,
    activeDealCount: 0,
  },
  'st-empty': {
    id: 'st-empty',
    name: '새로 문 연 동네빵집',
    imageUrl: null,
    distanceKm: 0.4,
    rating: 0,
    activeDealCount: 0,
  },
  'nb-1': { id: 'nb-1', name: '북카페 무드', imageUrl: null, distanceKm: 0.6, rating: 4.8, activeDealCount: 2 },
  'nb-3': { id: 'nb-3', name: '브레드앤버터', imageUrl: null, distanceKm: 0.9, rating: 4.7, activeDealCount: 0 },
}

/** 시드 단골 (연동 시 제거) — 배열 순서 = 등록순(favoritedAt asc). 활성/비활성·등록순 섞어 정렬 데모. */
const SEED: FavoriteStore[] = ['nb-3', 'st-break', 'st-closed', 'st-1'].map((id) => CATALOG[id])

let entries: FavoriteEntry[] = SEED.map((s, i) => ({ ...s, favoritedAt: i }))
let clock = SEED.length

const DEFAULT_NAMES = [
  '데일리 브레드',
  '오븐 베이커리',
  '베이글 공방',
  '국수나무 서교',
  '수제버거 그릴',
  '동네분식 서교점',
]

/** 카드 데이터 없이 추가될 때(알 수 없는 id) 결정적 카드 합성 — 연동 시 서버가 반환 */
function synthesize(id: string): FavoriteStore {
  const hash = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return {
    id,
    name: DEFAULT_NAMES[hash % DEFAULT_NAMES.length],
    imageUrl: null,
    distanceKm: Math.round((0.3 + (hash % 12) * 0.1) * 10) / 10,
    rating: Math.round((4 + (hash % 9) / 10) * 10) / 10,
    activeDealCount: hash % 3,
  }
}

/** 떨이 활성 매장 우선 → 등록순(favoritedAt asc) */
function sortEntries(list: FavoriteEntry[]): FavoriteEntry[] {
  return [...list].sort((a, b) => {
    const aActive = a.activeDealCount > 0
    const bActive = b.activeDealCount > 0
    if (aActive !== bActive) return aActive ? -1 : 1
    return a.favoritedAt - b.favoritedAt
  })
}

export const favoritesApi = {
  /** 본인 단골매장 목록 + 상단 통계 (떨이 우선 정렬). 상한 50이라 페이지네이션 X. */
  async list(): Promise<FavoriteList> {
    await delay(300)
    const sorted = sortEntries(entries)
    // favoriteStoreSchema 가 내부 정렬 필드(favoritedAt)를 strip
    return favoriteListSchema.parse({
      stores: sorted,
      totalCount: sorted.length,
      totalActiveDealCount: sorted.reduce((sum, s) => sum + s.activeDealCount, 0),
    })
  },

  /** 단골 추가 — idempotent(중복은 무시), 상한 50 초과 시 거부. card 없으면 서버가 카드 합성. */
  async add(id: string, card?: FavoriteStore): Promise<void> {
    await delay(150)
    if (entries.some((e) => e.id === id)) return // 이미 단골 — idempotent, 상한 미소진
    if (entries.length >= FAVORITE_LIMIT) {
      throw new ApiError(
        409,
        FAVORITE_ERROR.LIMIT_REACHED,
        `단골매장은 최대 ${FAVORITE_LIMIT}개까지 등록할 수 있어요`,
      )
    }
    entries.push({ ...(card ?? CATALOG[id] ?? synthesize(id)), id, favoritedAt: clock++ })
  },

  /** 단골 해제 — idempotent(없는 매장 해제도 안전) */
  async remove(id: string): Promise<void> {
    await delay(150)
    entries = entries.filter((e) => e.id !== id)
  },

  /** 단골 여부 (동기) — 매장 상세 isFavorite·홈 카드 하트 상태 산정에 사용 */
  isFavorite(id: string): boolean {
    return entries.some((e) => e.id === id)
  },
}

/** 테스트 전용 — `entries` 를 시드(또는 주어진 배열)로 리셋. 배열 순서 = 등록순. 연동 PR 에서 제거. */
export function __resetFavoritesStoreForTest(seed: FavoriteStore[] = SEED): void {
  entries = clone(seed).map((s, i) => ({ ...s, favoritedAt: i }))
  clock = seed.length
}
