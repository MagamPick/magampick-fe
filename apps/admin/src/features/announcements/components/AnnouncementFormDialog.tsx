import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ApiError } from '@/shared/lib/apiError'
import { AnnouncementForm } from './AnnouncementForm'
import { useCreateAnnouncement } from '../hooks/useCreateAnnouncement'
import { useUpdateAnnouncement } from '../hooks/useUpdateAnnouncement'
import type { AnnouncementFormValues } from '../lib/announcementFormSchema'
import type { AnnouncementMutationPayload, AnnouncementView } from '../types'

const EMPTY_DEFAULTS: AnnouncementFormValues = {
  tag: 'notice',
  pinned: false,
  title: '',
  body: '',
}

/** AnnouncementView → 폼 입력값 프리필 */
function toFormValues(a: AnnouncementView): AnnouncementFormValues {
  return { tag: a.tag, pinned: a.pinned, title: a.title, body: a.body }
}

function errorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiError) return error.message
  return '저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
}

/**
 * 공지 생성/수정 모달. announcement=null 이면 생성(즉시 발행), 있으면 수정(프리필).
 * 성공 시 닫고 목록 무효화(훅 onSuccess).
 */
export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: AnnouncementView | null
}) {
  const create = useCreateAnnouncement()
  const update = useUpdateAnnouncement(announcement?.id ?? 0)
  const mode = announcement ? 'edit' : 'create'

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      create.reset()
      update.reset()
    }
    onOpenChange(next)
  }

  const handleSubmit = (payload: AnnouncementMutationPayload) => {
    const onSuccess = () => onOpenChange(false)
    if (announcement) update.mutate(payload, { onSuccess })
    else create.mutate(payload, { onSuccess })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '공지 수정' : '새 공지'}</DialogTitle>
          <DialogDescription>
            발행 즉시 소비자·사장 앱의 공지 목록에 노출됩니다.
          </DialogDescription>
        </DialogHeader>
        <AnnouncementForm
          key={announcement?.id ?? 'create'}
          defaultValues={announcement ? toFormValues(announcement) : EMPTY_DEFAULTS}
          isPending={create.isPending || update.isPending}
          serverError={errorMessage(announcement ? update.error : create.error)}
          submitLabel={mode === 'edit' ? '수정 저장' : '발행'}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
