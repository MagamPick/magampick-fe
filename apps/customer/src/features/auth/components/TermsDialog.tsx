import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import type { SignupTerm } from '../types'

interface Props {
  terms: SignupTerm[]
  termId: number | null
  onClose: () => void
}

export function TermsDialog({ terms, termId, onClose }: Props) {
  const term = terms.find((t) => t.id === termId)
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
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
            {term?.body}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
