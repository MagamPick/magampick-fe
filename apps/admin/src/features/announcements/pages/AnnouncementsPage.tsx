import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { AnnouncementsTable } from '../components/AnnouncementsTable'
import { AnnouncementFormDialog } from '../components/AnnouncementFormDialog'
import { DeleteAnnouncementDialog } from '../components/DeleteAnnouncementDialog'
import type { AnnouncementView } from '../types'

function AnnouncementsTableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

/** 공지 관리 — 목록 + 생성/수정 모달 + 삭제 confirm. */
export function AnnouncementsPage() {
  const { data: announcements, isLoading, isError, refetch } = useAnnouncements()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AnnouncementView | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementView | null>(null)

  const openCreate = () => {
    setEditTarget(null)
    setFormOpen(true)
  }
  const openEdit = (a: AnnouncementView) => {
    setEditTarget(a)
    setFormOpen(true)
  }

  return (
    <section className="mx-auto max-w-5xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-foreground">공지사항 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            공지를 작성하면 즉시 발행되어 소비자·사장 앱에 노출됩니다.
          </p>
        </div>
        <Button onClick={openCreate}>새 공지</Button>
      </header>

      {isLoading ? (
        <AnnouncementsTableSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !announcements || announcements.length === 0 ? (
        <EmptyState icon={<Megaphone />}>등록된 공지가 없어요</EmptyState>
      ) : (
        <AnnouncementsTable
          announcements={announcements}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      )}

      <AnnouncementFormDialog open={formOpen} onOpenChange={setFormOpen} announcement={editTarget} />
      <DeleteAnnouncementDialog
        announcement={deleteTarget}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
      />
    </section>
  )
}
