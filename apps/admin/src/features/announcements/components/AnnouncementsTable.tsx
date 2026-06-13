import { Pin } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { AnnouncementTagBadge } from './AnnouncementTagBadge'
import type { AnnouncementView } from '../types'

const TH = 'px-4 py-3 font-semibold'

/** 공지 목록 데스크톱 테이블. 핀 우선 정렬은 상위(api)에서 보장. 액션은 부모로 콜백. */
export function AnnouncementsTable({
  announcements,
  onEdit,
  onDelete,
}: {
  announcements: AnnouncementView[]
  onEdit: (announcement: AnnouncementView) => void
  onDelete: (announcement: AnnouncementView) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <th className={cn(TH, 'w-12 text-center')}>핀</th>
            <th className={cn(TH, 'w-24')}>태그</th>
            <th className={TH}>제목</th>
            <th className={cn(TH, 'w-32')}>발행일</th>
            <th className={cn(TH, 'text-right')}>관리</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((a) => (
            <tr key={a.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 text-center">
                {a.pinned && (
                  <Pin
                    className="mx-auto size-4 fill-primary text-primary"
                    aria-label="상단 고정"
                  />
                )}
              </td>
              <td className="px-4 py-3">
                <AnnouncementTagBadge tag={a.tag} />
              </td>
              <td className="px-4 py-3 font-semibold text-foreground">{a.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(a)}>
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(a)}
                    className="text-destructive hover:text-destructive"
                  >
                    삭제
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
