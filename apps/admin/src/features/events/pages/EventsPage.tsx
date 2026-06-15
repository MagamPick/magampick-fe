import { useState } from 'react'
import { Ticket } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useEvents } from '../hooks/useEvents'
import { EventsTable } from '../components/EventsTable'
import { EventFormDialog } from '../components/EventFormDialog'
import { EndEventDialog } from '../components/EndEventDialog'
import type { EventView } from '../types'

function EventsTableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

/** 이벤트(쿠폰) 관리 — 목록 + 생성/수정 모달 + 조기종료 confirm. */
export function EventsPage() {
  const { data: events, isLoading, isError, refetch } = useEvents()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EventView | null>(null)
  const [endTarget, setEndTarget] = useState<EventView | null>(null)

  const openCreate = () => {
    setEditTarget(null)
    setFormOpen(true)
  }
  const openEdit = (e: EventView) => {
    setEditTarget(e)
    setFormOpen(true)
  }

  return (
    <section className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-foreground">이벤트 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            발급할 쿠폰 캠페인을 만들고 노출 기간·수량을 관리합니다.
          </p>
        </div>
        <Button onClick={openCreate}>새 이벤트</Button>
      </header>

      {isLoading ? (
        <EventsTableSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !events || events.length === 0 ? (
        <EmptyState icon={<Ticket />}>등록된 이벤트가 없어요</EmptyState>
      ) : (
        <EventsTable events={events} onEdit={openEdit} onEnd={setEndTarget} />
      )}

      <EventFormDialog open={formOpen} onOpenChange={setFormOpen} event={editTarget} />
      <EndEventDialog
        event={endTarget}
        onOpenChange={(next) => {
          if (!next) setEndTarget(null)
        }}
      />
    </section>
  )
}
