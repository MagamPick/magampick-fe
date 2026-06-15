import { useNavigate, useSearchParams } from 'react-router'
import { ChevronLeft, HelpCircle, MessageSquare } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { SegTabs, type SegTabItem } from '@/shared/components/SegTabs'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'
import { ROUTES } from '@/shared/lib/routes'
import { useFaqs } from '../hooks/useFaqs'
import { useInquiries } from '../hooks/useInquiries'
import { FaqList } from '../components/FaqList'
import { InquiryListItem } from '../components/InquiryListItem'

type SupportTab = 'faq' | 'inquiry'

/**
 * 고객센터 (노션 「문의하기」, 소비자 미러 — 사장 프로토타입엔 없음).
 * FAQ 탭 + 1:1 문의 탭(내 문의 내역 + [문의하기]). 탭 상태는 URL ?tab 으로 보존.
 */
export function SupportPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab: SupportTab = params.get('tab') === 'inquiry' ? 'inquiry' : 'faq'
  const setTab = (value: SupportTab) =>
    setParams(value === 'faq' ? {} : { tab: value }, { replace: true })

  const { data: faqs, isPending: faqsPending, isError: faqsError, refetch: refetchFaqs } = useFaqs()
  const {
    data: inquiries,
    isPending: inquiriesPending,
    isError: inquiriesError,
    refetch: refetchInquiries,
  } = useInquiries()

  const tabs: SegTabItem<SupportTab>[] = [
    { value: 'faq', label: 'FAQ' },
    { value: 'inquiry', label: '1:1 문의' },
  ]

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
        <h1 className="text-[17px] font-bold text-foreground">고객센터</h1>
      </header>

      <SegTabs ariaLabel="고객센터" tabs={tabs} value={tab} onChange={setTab} />

      <main className="flex-1">
        {tab === 'faq' ? (
          faqsPending ? (
            <ListRowSkeleton className="px-5 pt-4" media={false} />
          ) : faqsError ? (
            <ErrorState onRetry={() => refetchFaqs()}>FAQ를 불러오지 못했어요.</ErrorState>
          ) : faqs && faqs.length > 0 ? (
            <FaqList faqs={faqs} />
          ) : (
            <EmptyState icon={<HelpCircle />}>등록된 FAQ가 없어요.</EmptyState>
          )
        ) : (
          <div className="flex flex-col">
            <div className="px-5 pb-1 pt-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.SUPPORT_INQUIRY_NEW)}
                className="h-12 w-full rounded-xl bg-primary text-sm font-bold text-white"
              >
                문의하기
              </button>
            </div>
            {inquiriesPending ? (
              <ListRowSkeleton className="px-5 pt-4" media={false} />
            ) : inquiriesError ? (
              <ErrorState onRetry={() => refetchInquiries()}>
                문의 내역을 불러오지 못했어요.
              </ErrorState>
            ) : inquiries && inquiries.length > 0 ? (
              <div className="flex flex-col pt-2">
                {inquiries.map((inquiry) => (
                  <InquiryListItem
                    key={inquiry.id}
                    inquiry={inquiry}
                    onClick={() => navigate(ROUTES.SUPPORT_INQUIRY_DETAIL(inquiry.id))}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={<MessageSquare />}>아직 문의 내역이 없어요.</EmptyState>
            )}
          </div>
        )}
      </main>
    </ScreenContainer>
  )
}
