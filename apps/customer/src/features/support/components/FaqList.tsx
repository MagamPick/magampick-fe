import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { Faq } from '../types'

/**
 * FAQ 아코디언 (프로토타입 63-support `faq-list`) — 질문 탭하면 답변 펼침.
 * 한 번에 하나만 열림(다른 항목은 닫힘).
 */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="flex flex-col">
      {faqs.map((faq) => {
        const open = faq.id === openId
        return (
          <div key={faq.id} className="border-b border-border last:border-b-0">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : faq.id)}
              className="flex w-full items-center gap-2.5 px-5 py-4 text-left"
            >
              <span className="flex-1 text-sm font-semibold text-foreground">{faq.question}</span>
              <ChevronDown
                aria-hidden
                className={cn(
                  'size-[18px] shrink-0 text-[#bdbdbd] transition-transform',
                  open && 'rotate-180 text-primary',
                )}
              />
            </button>
            {open && (
              <div className="whitespace-pre-wrap px-5 pb-[18px] text-[13px] leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
