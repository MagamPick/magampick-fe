import { Store, Tag } from 'lucide-react'
import type { SearchSuggestion } from '../types'

interface AutocompleteDropdownProps {
  suggestions: SearchSuggestion[]
  /** 제안 탭 → 그 텍스트로 키워드 검색 실행 */
  onSelect: (text: string) => void
}

/**
 * 자동완성 드롭다운 — 입력 중 유사 매장명(매장 아이콘)·상품명(상품 아이콘) 제안.
 * 제안 0개면 미표시. 탭 시 그 검색어로 키워드 검색(엔티티 직접 이동 X — 명세).
 */
export function AutocompleteDropdown({ suggestions, onSelect }: AutocompleteDropdownProps) {
  if (suggestions.length === 0) return null
  return (
    <ul className="py-1">
      {suggestions.map((s) => {
        const Icon = s.kind === 'store' ? Store : Tag
        return (
          <li key={`${s.kind}:${s.text}`}>
            <button
              type="button"
              onClick={() => onSelect(s.text)}
              className="flex w-full items-center gap-2.5 px-5 py-2.5 text-left"
            >
              <Icon
                className="size-[18px] flex-shrink-0 text-muted-foreground"
                aria-label={s.kind === 'store' ? '매장' : '상품'}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{s.text}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
