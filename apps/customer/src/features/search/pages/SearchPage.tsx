import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import type { StoreSort } from '@/features/store-list/types'
import { AutocompleteDropdown } from '../components/AutocompleteDropdown'
import { RecentSearches } from '../components/RecentSearches'
import { SearchHeader } from '../components/SearchHeader'
import { SearchResults } from '../components/SearchResults'
import { useAutocomplete } from '../hooks/useAutocomplete'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useKeywordSearch } from '../hooks/useKeywordSearch'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { searchParamsSchema } from '../types'

function ResultsSkeleton() {
  return (
    <div className="px-5 pt-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border py-[13px]">
          <div className="size-16 flex-shrink-0 animate-pulse rounded-[12px] bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 검색 (소비자) — 한 화면 3-state: 검색 홈(최근 검색어) / 자동완성(입력 중) / 결과(제출).
 * 제출(Enter·제안 탭·최근칩 탭)된 검색어·정렬은 URL(`?q=&sort=`) — 결과→상세→뒤로 시 복원.
 * 라이브 입력값(inputValue)은 로컬 — 타이핑마다 URL 갱신 X, 제출 시에만 replace.
 * 노션: 키워드 검색 / 검색 자동완성 / 검색 기록 저장·삭제 (Phase 9).
 */
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { q, sort } = searchParamsSchema.parse(Object.fromEntries(searchParams))
  const navigate = useNavigate()

  const [inputValue, setInputValue] = useState(q)
  const accountId = useAuthStore((s) => s.user?.id)
  const { history, add, removeOne, clear } = useSearchHistory(accountId)

  const trimmed = inputValue.trim()
  const mode: 'home' | 'autocomplete' | 'results' =
    trimmed === '' ? 'home' : trimmed === q ? 'results' : 'autocomplete'

  const debounced = useDebouncedValue(inputValue, 200)
  const autocomplete = useAutocomplete(mode === 'autocomplete' ? debounced : '')
  const search = useKeywordSearch(q, sort)

  /** 키워드 검색 실행 — Enter / 제안 탭 / 최근칩 탭. 기록 저장 + URL 갱신(replace). */
  const runSearch = (raw: string) => {
    const term = raw.trim()
    if (!term) return
    add(term)
    setInputValue(term)
    setSearchParams({ q: term, sort }, { replace: true })
  }

  const handleSortChange = (next: StoreSort) => {
    setSearchParams({ q, sort: next }, { replace: true })
  }

  const handleClear = () => {
    setInputValue('')
    setSearchParams({}, { replace: true })
  }

  return (
    <ScreenContainer variant="page">
      <SearchHeader
        value={inputValue}
        onChange={setInputValue}
        onSubmit={() => runSearch(inputValue)}
        onClear={handleClear}
        onBack={() => navigate(-1)}
      />

      {mode === 'home' && (
        <RecentSearches items={history} onSelect={runSearch} onRemove={removeOne} onClear={clear} />
      )}

      {mode === 'autocomplete' && (
        <AutocompleteDropdown suggestions={autocomplete.data ?? []} onSelect={runSearch} />
      )}

      {mode === 'results' &&
        (search.isPending ? (
          <ResultsSkeleton />
        ) : search.isError ? (
          <p className="px-5 py-10 text-sm font-medium text-muted-foreground">
            지금은 검색하지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        ) : search.data ? (
          <SearchResults result={search.data} sort={sort} onSortChange={handleSortChange} />
        ) : null)}
    </ScreenContainer>
  )
}
