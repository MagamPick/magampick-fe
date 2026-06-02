import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { useStores } from '../hooks/useStores'
import { useCurrentStoreStore } from '../stores/currentStoreStore'
import { getStatusDotClass, getStoreListLabel } from '../lib/transitions'

/**
 * 매장 전환 모달 (노션: 보유 매장 목록 조회) — 히어로 매장명 탭 → 보유 매장 목록.
 * 각 항목은 매장명 + 영업 상태 라벨. 선택 시 현재 매장 전환, 하단 [매장 추가]로 경로 B 등록 진입.
 */
export function StoreSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
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
                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-foreground">
                    {store.name}
                  </span>
                  <span className="ml-3 inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground">
                    <span
                      className={cn('size-2 rounded-full', getStatusDotClass(store.operationStatus))}
                    />
                    {getStoreListLabel(store.operationStatus)}
                  </span>
                </button>
              )
            })}

            {/* 매장 추가 → 매장 등록 신청 (경로 B) */}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate(ROUTES.STORE_NEW)
              }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-border py-3.5 text-[14px] font-bold text-foreground active:bg-muted"
            >
              <Plus className="size-[18px]" />
              매장 추가
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
