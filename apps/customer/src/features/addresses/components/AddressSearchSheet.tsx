import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { useAddressSearch } from '../hooks/useAddressSearch'
import type { AddressSearchResult } from '../types'

/**
 * 주소 검색 바텀시트 (프로토타입 99-addr-sheet). 도로명·건물명 검색(mock 카카오) →
 * 결과 선택 시 onSelect 로 도로명+좌표 전달하고 닫힌다. 좌표는 등록(create)에 그대로 쓰인다.
 */
interface AddressSearchSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (result: AddressSearchResult) => void
}

export function AddressSearchSheet({ open, onOpenChange, onSelect }: AddressSearchSheetProps) {
  const [query, setQuery] = useState('')
  const { data: results, isFetching } = useAddressSearch(query)

  function handleSelect(result: AddressSearchResult) {
    onSelect(result)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[84%] rounded-t-[22px] px-5 pb-6">
        <SheetHeader className="px-0">
          <SheetTitle>주소 검색</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 rounded-xl border-[1.5px] border-input bg-background px-3.5 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도로명·동/리·우편번호 검색"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-[#bdbdbd]"
            aria-label="주소 검색어"
          />
        </div>

        <div className="mt-1 overflow-y-auto">
          {query.trim().length === 0 ? (
            <p className="py-8 text-center text-[13px] text-muted-foreground">
              도로명·건물명으로 검색해보세요.
            </p>
          ) : isFetching ? (
            <p className="py-8 text-center text-[13px] text-muted-foreground">검색 중…</p>
          ) : results && results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li key={`${result.roadAddress}-${result.zip ?? ''}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="flex min-h-[56px] w-full flex-col justify-center gap-0.5 border-b border-border py-3.5 text-left last:border-b-0"
                  >
                    <span className="text-sm text-foreground">{result.roadAddress}</span>
                    {result.zip && (
                      <span className="text-xs text-muted-foreground">{result.zip}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-[13px] text-muted-foreground">
              검색 결과가 없어요.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
