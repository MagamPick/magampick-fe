import { cn } from '@/shared/lib/utils'
import { NOTICE_TAG_CLASS, NOTICE_TAG_LABEL, type NoticeTag } from '../types'

/** 공지 태그 배지 (프로토타입 `an-item__tag` — radius 6 · 10.5px · 700) */
export function NoticeTagBadge({ tag, className }: { tag: NoticeTag; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-[7px] py-0.5 text-[10.5px] font-bold',
        NOTICE_TAG_CLASS[tag],
        className,
      )}
    >
      {NOTICE_TAG_LABEL[tag]}
    </span>
  )
}
