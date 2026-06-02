import { useCallback, useState } from 'react'
import { addEntry, readHistory, writeHistory } from '../lib/searchHistory'

/**
 * 검색 기록 훅 — 계정별 localStorage 를 읽고 쓴다. `{ history, add, removeOne, clear }`.
 * accountId 가 바뀌면(계정 전환) 해당 계정 기록으로 다시 읽는다 — React "렌더 중 prop 변경 시
 * state 조정" 패턴(effect 불필요). 변경(add/removeOne/clear)은 localStorage 최신값 기준으로
 * 계산해 stale 클로저를 피한다.
 */
export function useSearchHistory(accountId: string | number | null | undefined) {
  const [history, setHistory] = useState<string[]>(() => readHistory(accountId))
  const [trackedId, setTrackedId] = useState(accountId)

  if (trackedId !== accountId) {
    setTrackedId(accountId)
    setHistory(readHistory(accountId))
  }

  const persist = useCallback(
    (next: string[]) => {
      setHistory(next)
      writeHistory(accountId, next)
    },
    [accountId],
  )

  const add = useCallback(
    (q: string) => persist(addEntry(readHistory(accountId), q)),
    [accountId, persist],
  )
  const removeOne = useCallback(
    (q: string) => persist(readHistory(accountId).filter((x) => x !== q)),
    [accountId, persist],
  )
  const clear = useCallback(() => persist([]), [persist])

  return { history, add, removeOne, clear }
}
