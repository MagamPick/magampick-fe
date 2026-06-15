import { InquiryStatusBadge } from './InquiryStatusBadge'
import { inquiryCategoryLabel } from '../lib/inquiryFormat'
import type { InquiryView } from '../types'

const TH = 'px-4 py-3 font-semibold'

/** 문의 목록 데스크톱 테이블. 행 클릭/Enter → 답변 패널(onSelect). */
export function InquiriesTable({
  inquiries,
  onSelect,
}: {
  inquiries: InquiryView[]
  onSelect: (inquiry: InquiryView) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <th className={TH}>상태</th>
            <th className={TH}>카테고리</th>
            <th className={TH}>제목</th>
            <th className={TH}>접수일</th>
            <th className={TH}>답변일</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((q) => (
            <tr
              key={q.id}
              role="button"
              tabIndex={0}
              aria-label={`${q.title} 문의 열기`}
              onClick={() => onSelect(q)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(q)
                }
              }}
              className="cursor-pointer border-b border-border outline-none transition last:border-0 hover:bg-muted/40 focus-visible:bg-muted/40"
            >
              <td className="px-4 py-3">
                <InquiryStatusBadge status={q.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{inquiryCategoryLabel(q.category)}</td>
              <td className="px-4 py-3 font-semibold text-foreground">{q.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{q.createdAt}</td>
              <td className="px-4 py-3 text-muted-foreground">{q.answer?.answeredAt ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
