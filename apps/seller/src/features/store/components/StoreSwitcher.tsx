import { useState, useEffect } from 'react'
import { ChevronDown, Plus, Store } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { useStores } from '../hooks/useStores'
import { useCurrentStoreStore } from '../stores/currentStoreStore'
import { getStatusDotClass, getStoreListLabel } from '../lib/transitions'

interface Props {
  /**
   * 트리거 모양 — `hero`: 홈 히어로의 흰 텍스트 매장명(기본) / `chip`: 통계 등 밝은 헤더의 테두리 칩.
   * 어느 쪽이든 같은 매장 전환 시트를 연다(시트 로직 공유).
   */
  variant?: 'hero' | 'chip'
}

/**
 * 매장 전환 모달 (노션: 보유 매장 목록 조회) — 매장명 트리거 탭 → 보유 매장 목록.
 * 각 항목은 매장명 + 영업 상태 라벨. 선택 시 현재 매장 전환, 하단 [매장 추가]로 경로 B 등록 진입.
 */
export function StoreSwitcher({ variant = 'hero' }: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: stores } = useStores()
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)
  const selectStore = useCurrentStoreStore((s) => s.selectStore)

  // 로그인 직후 등록순 첫 매장 자동 선택 (보유목록 명세)
  // useEffect + zustand action → React Compiler useEffect-setState 제약 없음
  useEffect(() => {
    if (stores && stores.length > 0 && selectedStoreId == null) {
      selectStore(stores[0].id)
    }
  }, [stores, selectedStoreId, selectStore])

  const current = stores?.find((s) => s.id === selectedStoreId)
  const name = current?.name ?? '매장 선택'

  return (
    <>
      {variant === 'chip' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="매장 전환"
          className="inline-flex h-9 max-w-[200px] items-center gap-1.5 rounded-[18px] border border-[#FFD9C7] bg-secondary px-3 text-[12.5px] font-bold tracking-[-0.2px] text-secondary-foreground transition active:bg-[#FFD9C7]"
        >
          <Store aria-hidden className="size-[14px] shrink-0" />
          <span className="truncate">{name}</span>
          <ChevronDown className="size-3.5 shrink-0 text-primary" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex max-w-full items-center gap-1 text-left text-white"
          aria-label="매장 전환"
        >
          <span className="truncate text-[18px] font-bold tracking-tight">{name}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </button>
      )}

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
                      className={cn(
                        'size-2 rounded-full',
                        getStatusDotClass(store.operationStatus),
                      )}
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
