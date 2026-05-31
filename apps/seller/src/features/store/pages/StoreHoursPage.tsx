import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { useBusinessHours } from '@/features/store/hooks/useBusinessHours'
import { useSaveBusinessHours } from '@/features/store/hooks/useSaveBusinessHours'
import { useTransitionStatus } from '@/features/store/hooks/useTransitionStatus'
import { BusinessHoursList } from '@/features/store/components/BusinessHoursList'
import { BusinessHourEditSheet } from '@/features/store/components/BusinessHourEditSheet'
import { TempClosureCard } from '@/features/store/components/TempClosureCard'
import { toFormDays, toBusinessHours } from '@/features/store/lib/businessHours'
import { businessHoursFormSchema, WEEKDAYS } from '@/features/store/types'
import type { BusinessHoursForm } from '@/features/store/types'

/** 영업시간 설정 — 요일별 영업시간 편집 + 저장. 영업중 오늘 행은 잠금. (노션: 영업시간 설정) */
export function StoreHoursPage() {
  const navigate = useNavigate()
  const storeId = useCurrentStoreStore((s) => s.selectedStoreId)
  const { data: hours, isLoading } = useBusinessHours(storeId)
  const { data: status } = useStoreStatus(storeId)
  const save = useSaveBusinessHours(storeId)
  const transition = useTransitionStatus(storeId)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const today = WEEKDAYS[new Date().getDay()]
  const todayPersistedOpen = (hours ?? []).some((h) => h.day === today)
  const todayLocked = status?.operationStatus === 'OPEN' && todayPersistedOpen

  const form = useForm<BusinessHoursForm>({
    resolver: zodResolver(businessHoursFormSchema),
    values: { days: toFormDays(hours ?? []) },
  })
  const days = form.watch('days')
  const editingDay = editingIndex !== null ? (days[editingIndex] ?? null) : null

  function onSubmit(values: BusinessHoursForm) {
    save.mutate(toBusinessHours(values.days))
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-8">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.STORE_MANAGE)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">영업시간</h1>
      </header>

      {isLoading || !hours ? (
        <p className="px-5 py-10 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <BusinessHoursList
            days={days}
            today={today}
            operationStatus={status?.operationStatus}
            todayPersistedOpen={todayPersistedOpen}
            onEditDay={setEditingIndex}
          />

          {todayLocked && (
            <p className="mx-5 mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              영업 중에는 오늘 영업시간을 변경할 수 없어요. 다른 요일은 자유롭게 수정할 수 있어요.
            </p>
          )}

          <TempClosureCard
            closedToday={status?.operationStatus === 'CLOSED_TODAY'}
            disabled={!status || transition.isPending}
            onToggle={(closed) => transition.mutate(closed ? 'CLOSED_TODAY' : 'OPEN')}
          />
          {transition.isError && (
            <p role="alert" className="mx-5 mt-2 text-[12.5px] font-semibold text-destructive">
              {transition.error instanceof Error
                ? transition.error.message
                : '상태 전환에 실패했어요.'}
            </p>
          )}

          {save.isSuccess && (
            <p role="status" className="mx-5 mt-3 text-[12.5px] font-semibold text-success">
              영업시간을 저장했어요.
            </p>
          )}
          {save.isError && (
            <p role="alert" className="mx-5 mt-3 text-[12.5px] font-semibold text-destructive">
              {save.error instanceof Error
                ? save.error.message
                : '저장에 실패했어요. 잠시 후 다시 시도해 주세요.'}
            </p>
          )}

          <div className="mt-auto px-5 pt-6">
            <Button
              type="submit"
              disabled={save.isPending}
              className="h-[52px] w-full rounded-[12px] text-[15px] font-bold"
            >
              {save.isPending ? '저장 중…' : '변경 저장'}
            </Button>
          </div>
        </form>
      )}

      <BusinessHourEditSheet
        open={editingIndex !== null}
        onOpenChange={(o) => {
          if (!o) setEditingIndex(null)
        }}
        day={editingDay}
        onSave={(next) => {
          if (editingIndex === null) return
          const nextDays = days.map((d, i) => (i === editingIndex ? next : d))
          form.setValue('days', nextDays, { shouldDirty: true, shouldValidate: true })
        }}
      />
    </div>
  )
}
