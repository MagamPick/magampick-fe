import { useNavigate } from 'react-router'

/**
 * 섹션 제목 + (선택) 더보기. 더보기는 해당 목록 탭으로 이동.
 * 정렬 파라미터(마감임박순/추천순)는 전체 매장 화면 스펙 확정 시 추가 — 지금은 plain navigate.
 */
export function SectionHeader({ title, moreTo }: { title: string; moreTo?: string }) {
  const navigate = useNavigate()
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-extrabold tracking-[-0.3px]">{title}</h2>
      {moreTo && (
        <button
          type="button"
          onClick={() => navigate(moreTo)}
          className="-mr-1 min-h-11 px-1 text-xs font-semibold text-muted-foreground"
        >
          더보기
        </button>
      )}
    </div>
  )
}
