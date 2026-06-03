import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { Notice } from '../types'
import { NoticeTagBadge } from './NoticeTagBadge'

/**
 * 공지 아코디언 (프로토타입 61-notices, 소비자 통일) — 핀 📌·태그·날짜·제목, 탭하면 본문 펼침.
 * 한 번에 하나만 열림(다른 항목은 닫힘). 펼친 본문은 줄바꿈 보존.
 */
export function NoticeAccordion({ notices }: { notices: Notice[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="flex flex-col">
      {notices.map((notice) => {
        const open = notice.id === openId
        return (
          <div key={notice.id} className="border-b border-border last:border-b-0">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : notice.id)}
              className="flex w-full flex-col gap-1.5 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-2">
                {notice.pinned && (
                  <span aria-hidden className="text-[13px] leading-none">
                    📌
                  </span>
                )}
                <NoticeTagBadge tag={notice.tag} />
                <span className="ml-auto text-[12.5px] font-semibold text-muted-foreground">
                  {notice.date}
                </span>
              </span>
              <span className="flex items-start gap-2">
                <span className="flex-1 text-sm font-bold leading-snug text-foreground">
                  {notice.title}
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    'mt-0.5 size-[18px] shrink-0 text-placeholder transition-transform',
                    open && 'rotate-180 text-primary',
                  )}
                />
              </span>
            </button>
            {open && (
              <div className="whitespace-pre-wrap px-5 pb-[18px] pt-1 text-[13px] leading-relaxed text-muted-foreground">
                {notice.body}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
