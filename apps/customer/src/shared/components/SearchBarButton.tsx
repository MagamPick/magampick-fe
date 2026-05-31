import { Search } from 'lucide-react'
import { useComingSoon } from '@/shared/hooks/useComingSoon'

/**
 * 검색 진입 버튼 — 홈·전체 매장 탭 공통 상단 검색바. 키워드 검색은 별도(Phase 11)라
 * 탭 시 "준비 중" 안내. `ComingSoonProvider` 안에서 사용.
 */
export function SearchBarButton() {
  const { show } = useComingSoon()
  return (
    <button
      type="button"
      onClick={() => show('검색은 준비 중이에요.')}
      className="mx-5 mt-4 flex h-[46px] w-[calc(100%_-_40px)] items-center gap-2 rounded-[12px] bg-background px-[14px] text-sm font-medium text-[#bdbdbd]"
    >
      <Search className="size-[18px] flex-shrink-0 text-muted-foreground" aria-hidden />
      가게·메뉴를 검색해 보세요
    </button>
  )
}
