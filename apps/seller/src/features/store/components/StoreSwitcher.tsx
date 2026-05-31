import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { cn } from '@/shared/lib/utils'
import { useStores } from '../hooks/useStores'
import { useCurrentStoreStore } from '../stores/currentStoreStore'

/** 히어로 매장명 → 간이 매장 전환 시트 (멀티스토어: 계정 1 - 매장 N) */
export function StoreSwitcher() {
  const [open, setOpen] = useState(false)
  const { data: stores } = useStores()
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)
  const selectStore = useCurrentStoreStore((s) => s.selectStore)
  const current = stores?.find((s) => s.id === selectedStoreId)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex max-w-full items-center gap-1 text-left text-white"
        aria-label="매장 전환"
      >
        <span className="truncate text-[18px] font-bold tracking-tight">
          {current?.name ?? '매장 선택'}
        </span>
        <ChevronDown className="size-3.5 shrink-0" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-md rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,16px)+8px)]"
        >
          <SheetHeader>
            <SheetTitle className="text-[18px] font-bold">매장 전환</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4 pb-2">
            {stores?.map((store) => {
              const selected = store.id === selectedStoreId
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => {
                    selectStore(store.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[14px] border-[1.5px] px-4 py-4 text-left',
                    selected ? 'border-primary bg-secondary' : 'border-border bg-card',
                  )}
                >
                  <span className="text-[15px] font-bold text-foreground">{store.name}</span>
                  {selected && <span className="text-[12.5px] font-bold text-primary">선택됨</span>}
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
