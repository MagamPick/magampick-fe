import type { ReactNode } from 'react'

interface MenuGroupProps {
  title: string
  children: ReactNode
}

/** 마이페이지 메뉴 그룹 (프로토타입 03-components `.menu-group__title` + `.menu-card`) */
export function MenuGroup({ title, children }: MenuGroupProps) {
  return (
    <section>
      <h2 className="px-5 pb-1 pt-[22px] text-xs font-bold text-muted-foreground">{title}</h2>
      <div className="mx-5 overflow-hidden rounded-[14px] border border-border bg-card">
        {children}
      </div>
    </section>
  )
}
