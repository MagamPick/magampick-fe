import { useState } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useInquiries } from '../hooks/useInquiries'
import { InquiryFilters } from '../components/InquiryFilters'
import { InquiriesTable } from '../components/InquiriesTable'
import { InquiriesPagination } from '../components/InquiriesPagination'
import { InquiryAnswerDialog } from '../components/InquiryAnswerDialog'
import {
  ALL_FILTER,
  toListParams,
  type CategoryFilter,
  type StatusFilter,
} from '../lib/inquiryFilters'
import type { InquiryView } from '../types'

function TableSkeleton() {
  return (
    <div
      data-testid="inquiries-skeleton"
      className="space-y-2 rounded-xl border border-border bg-card p-4"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

/** 문의 관리 — 필터 + 페이지네이션 목록 + 답변 다이얼로그. */
export function InquiriesPage() {
  const [status, setStatus] = useState<StatusFilter>(ALL_FILTER)
  const [category, setCategory] = useState<CategoryFilter>(ALL_FILTER)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<InquiryView | null>(null)

  const { data, isLoading, isError, refetch } = useInquiries(toListParams(status, category, page))

  // 필터 변경 시 page 0 리셋
  const changeStatus = (value: StatusFilter) => {
    setStatus(value)
    setPage(0)
  }
  const changeCategory = (value: CategoryFilter) => {
    setCategory(value)
    setPage(0)
  }

  const inquiries = data?.content ?? []

  return (
    <section className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-h2 font-bold text-foreground">문의 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          소비자 1:1 문의를 확인하고 답변합니다. 답변하면 소비자에게 자동으로 알림이 전송됩니다.
        </p>
      </header>

      <div className="mb-4">
        <InquiryFilters
          status={status}
          category={category}
          onStatusChange={changeStatus}
          onCategoryChange={changeCategory}
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : inquiries.length === 0 ? (
        <EmptyState icon="💬">조건에 맞는 문의가 없어요</EmptyState>
      ) : (
        <>
          <InquiriesTable inquiries={inquiries} onSelect={setSelected} />
          {data && (
            <InquiriesPagination
              page={data.page}
              totalPages={data.totalPages}
              hasPrevious={data.hasPrevious}
              hasNext={data.hasNext}
              onChange={setPage}
            />
          )}
        </>
      )}

      <InquiryAnswerDialog
        inquiry={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </section>
  )
}
