import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { ErrorState } from '@/shared/components/ErrorState'
import { TermsDialog } from '@/features/auth/components/TermsDialog'
import { useTerms } from '@/features/auth/hooks/useTerms'

/** 약관 및 정책 — 가입 시 동의한 약관 목록 + 본문 열람. 마이페이지에서 진입 (풀스크린). */
export function TermsPolicyPage() {
  const navigate = useNavigate()
  const { data: terms, isPending, isError, refetch } = useTerms()
  const [openTermId, setOpenTermId] = useState<number | null>(null)

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex size-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">약관 및 정책</h1>
      </header>

      <main className="flex-1">
        {isPending ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex h-[54px] items-center px-5">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()}>약관을 불러오지 못했어요.</ErrorState>
        ) : (
          <ul className="divide-y divide-border">
            {terms?.map((term) => (
              <li key={term.id}>
                <button
                  type="button"
                  onClick={() => setOpenTermId(term.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <span className="text-[15px] font-medium text-foreground">{term.title}</span>
                    <span className="ml-2 text-[12px] text-muted-foreground">
                      {term.required ? '필수' : '선택'}
                    </span>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {terms && (
        <TermsDialog terms={terms} termId={openTermId} onClose={() => setOpenTermId(null)} />
      )}
    </ScreenContainer>
  )
}
