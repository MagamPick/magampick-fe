import { useNavigate, useParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { INQUIRY_CATEGORY_LABEL } from '../types'
import { useInquiry } from '../hooks/useInquiry'
import { InquiryStatusBadge } from '../components/InquiryStatusBadge'

/** 문의 상세 — 문의 본문 + 답변(있으면) / 대기 안내. 1문의 1답변. */
export function InquiryDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: inquiry, isLoading, isError } = useInquiry(id ?? '')

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
        <h1 className="text-[17px] font-bold text-foreground">문의 상세</h1>
      </header>

      <main className="flex-1 px-5 py-5">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">불러오는 중…</p>
        ) : isError || !inquiry ? (
          <EmptyState icon="🔍">문의를 찾을 수 없어요.</EmptyState>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-muted-foreground">
                  {INQUIRY_CATEGORY_LABEL[inquiry.category]}
                </span>
                <InquiryStatusBadge status={inquiry.status} className="ml-auto" />
              </div>
              <h2 className="mt-1.5 text-[17px] font-bold text-foreground">{inquiry.title}</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{inquiry.createdAt}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {inquiry.content}
              </p>
            </div>

            <div className="rounded-2xl bg-background p-4">
              <h3 className="text-[13px] font-bold text-primary">답변</h3>
              {inquiry.answer ? (
                <>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {inquiry.answer.content}
                  </p>
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    {inquiry.answer.answeredAt}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  답변을 준비하고 있어요. 답변이 등록되면 푸시 알림으로 알려드릴게요.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </ScreenContainer>
  )
}
