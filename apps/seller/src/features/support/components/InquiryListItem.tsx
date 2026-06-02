import { INQUIRY_CATEGORY_LABEL, type Inquiry } from '../types'
import { InquiryStatusBadge } from './InquiryStatusBadge'

/** 내 문의 내역 항목 — 카테고리·상태·제목·작성일. 탭하면 상세로 이동 */
export function InquiryListItem({ inquiry, onClick }: { inquiry: Inquiry; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-1.5 border-b border-border px-5 py-4 text-left last:border-b-0"
    >
      <span className="flex items-center gap-2">
        <span className="text-[11.5px] font-semibold text-muted-foreground">
          {INQUIRY_CATEGORY_LABEL[inquiry.category]}
        </span>
        <InquiryStatusBadge status={inquiry.status} className="ml-auto" />
      </span>
      <span className="text-sm font-bold leading-snug text-foreground">{inquiry.title}</span>
      <span className="text-[12px] text-muted-foreground">{inquiry.createdAt}</span>
    </button>
  )
}
