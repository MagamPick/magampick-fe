import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'

/**
 * 검색 진입 버튼 — 홈·전체 매장 탭 공통 상단 검색바. 탭 시 검색 화면(`/search`)으로 이동
 * (키워드 검색·자동완성·최근 검색어, Phase 9).
 */
export function SearchBarButton() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.SEARCH)}
      className="mx-5 mt-4 flex h-[46px] w-[calc(100%_-_40px)] items-center gap-2 rounded-[12px] bg-background px-[14px] text-sm font-medium text-[#bdbdbd]"
    >
      <Search className="size-[18px] flex-shrink-0 text-muted-foreground" aria-hidden />
      가게·메뉴를 검색해 보세요
    </button>
  )
}
