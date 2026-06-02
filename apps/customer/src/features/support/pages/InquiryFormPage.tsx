import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { ROUTES } from '@/shared/lib/routes'
import { InquiryForm } from '../components/InquiryForm'

/** 1:1 문의 작성 (고객센터 → [문의하기]). 제출 성공 시 해당 문의 상세로 이동. */
export function InquiryFormPage() {
  const navigate = useNavigate()

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
        <h1 className="text-[17px] font-bold text-foreground">문의하기</h1>
      </header>

      <main className="flex-1">
        <InquiryForm
          onSubmitted={(inquiry) =>
            navigate(ROUTES.SUPPORT_INQUIRY_DETAIL(inquiry.id), { replace: true })
          }
        />
      </main>
    </ScreenContainer>
  )
}
