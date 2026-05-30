import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { TERMS } from '../constants/terms'
import type { TermId } from '../types'

interface Props {
  termId: TermId | null
  onClose: () => void
}

// 약관 보기 — 중앙 팝업 모달 (조항별 본문)
export function TermsDialog({ termId, onClose }: Props) {
  const term = TERMS.find((t) => t.id === termId)
  return (
    <Dialog open={termId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[78vh] gap-0 p-0">
        <DialogHeader className="border-b border-border pr-12">
          <DialogTitle>{term?.title}</DialogTitle>
          <DialogDescription className="text-xs">
            {term?.required ? '필수 동의 항목' : '선택 동의 항목'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {term?.sections.map((s) => (
              <section key={s.heading}>
                <h3 className="mb-1 text-[13px] font-bold text-foreground">{s.heading}</h3>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
