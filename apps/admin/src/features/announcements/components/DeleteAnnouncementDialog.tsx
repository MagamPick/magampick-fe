import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/apiError'
import { useDeleteAnnouncement } from '../hooks/useDeleteAnnouncement'
import type { AnnouncementView } from '../types'

/**
 * 공지 삭제 confirm 모달. announcement !== null 이면 열림.
 * 삭제 → DELETE /admin/announcements/{id} → 성공 시 닫고 목록 무효화(훅 onSuccess).
 */
export function DeleteAnnouncementDialog({
  announcement,
  onOpenChange,
}: {
  announcement: AnnouncementView | null
  onOpenChange: (open: boolean) => void
}) {
  const del = useDeleteAnnouncement(announcement?.id ?? 0)

  const handleOpenChange = (next: boolean) => {
    if (!next) del.reset()
    onOpenChange(next)
  }

  const handleDelete = () => {
    del.mutate(undefined, { onSuccess: () => onOpenChange(false) })
  }

  const serverError =
    del.error instanceof ApiError
      ? del.error.message
      : del.error
        ? '삭제 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
        : null

  return (
    <Dialog open={announcement !== null} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>공지 삭제</DialogTitle>
          <DialogDescription>
            <b className="font-semibold text-foreground">{announcement?.title}</b> 공지를 삭제할까요?
            소비자 노출에서도 제거됩니다.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <p role="alert" className="px-5 text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={del.isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={del.isPending}
          >
            {del.isPending ? '삭제 중…' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
