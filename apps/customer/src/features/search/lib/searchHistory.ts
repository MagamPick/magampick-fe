/**
 * 검색 기록 — 기기 로컬(localStorage) 저장, 계정별 키로 분리 (노션: 검색 기록 저장/삭제).
 * 서버 저장·기기 간 동기화 X. 같은 기기에서 계정마다 별도 저장 → 로그아웃·계정 전환 시
 * 다른 계정 기록과 안 섞인다(시연 때 계정 전환 고려).
 */

/** 최근 검색어 최대 개수 — 초과 시 가장 오래된 것부터 제거 (노션 예시 N=10) */
export const SEARCH_HISTORY_MAX = 10

const KEY_PREFIX = 'magampick-search-history'

/** 계정별 localStorage 키 — 비로그인/미상이면 'guest' */
export function searchHistoryKey(accountId: string | number | null | undefined): string {
  return `${KEY_PREFIX}:${accountId ?? 'guest'}`
}

/**
 * 검색어 추가 (순수) — 같은 검색어는 제거 후 맨 앞으로(중복 안 쌓임), 최대 N개 유지.
 * 빈 문자열/공백만 있는 입력은 무시(원본 그대로 반환).
 */
export function addEntry(list: string[], query: string): string[] {
  const q = query.trim()
  if (!q) return list
  const deduped = list.filter((x) => x !== q)
  return [q, ...deduped].slice(0, SEARCH_HISTORY_MAX)
}

/** 계정별 기록 읽기 — 없음/손상/SSR 환경은 빈 배열 */
export function readHistory(accountId: string | number | null | undefined): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(searchHistoryKey(accountId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** 계정별 기록 저장 — 용량 초과 등 실패는 무시(기록은 보조 기능) */
export function writeHistory(
  accountId: string | number | null | undefined,
  list: string[],
): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(searchHistoryKey(accountId), JSON.stringify(list))
  } catch {
    // ignore (quota 등)
  }
}
