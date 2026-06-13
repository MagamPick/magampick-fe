import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { INQUIRY_CATEGORY_OPTIONS, INQUIRY_STATUS_LABEL } from '../lib/inquiryFormat'
import { ALL_FILTER, type CategoryFilter, type StatusFilter } from '../lib/inquiryFilters'

/** 상단 필터 — 상태(전체/대기/답변완료) + 카테고리(전체 + 9개). 변경 시 page 리셋은 호출 측 담당. */
export function InquiryFilters({
  status,
  category,
  onStatusChange,
  onCategoryChange,
}: {
  status: StatusFilter
  category: CategoryFilter
  onStatusChange: (value: StatusFilter) => void
  onCategoryChange: (value: CategoryFilter) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-40">
        <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
          <SelectTrigger size="sm" aria-label="상태 필터">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>전체 상태</SelectItem>
            <SelectItem value="pending">{INQUIRY_STATUS_LABEL.pending}</SelectItem>
            <SelectItem value="answered">{INQUIRY_STATUS_LABEL.answered}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-44">
        <Select value={category} onValueChange={(v) => onCategoryChange(v as CategoryFilter)}>
          <SelectTrigger size="sm" aria-label="카테고리 필터">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>전체 카테고리</SelectItem>
            {INQUIRY_CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
