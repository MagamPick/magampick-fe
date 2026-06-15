import { Check, Pencil, MapPin } from 'lucide-react'
import type { Address } from '../types'

/**
 * 주소 카드 (프로토타입 60-addresses `.addr-card`). 그리드 [핀 · 본문 · 체크 · 수정].
 * 본문 탭 → 기본 주소로 전환(onSelect), ✎ → 수정(onEdit). 기본 주소는 배지 + 체크 표시.
 */
interface AddressCardProps {
  address: Address
  onSelect: () => void
  onEdit: () => void
  disabled?: boolean
}

export function AddressCard({ address, onSelect, onEdit, disabled }: AddressCardProps) {
  const { label, roadAddress, detailAddress, isDefault } = address
  return (
    <div className="grid grid-cols-[28px_1fr_28px_36px] items-center gap-2.5 border-b border-border py-[18px] last:border-b-0">
      <MapPin aria-hidden className="mx-auto size-[18px] text-muted-foreground" />
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled || isDefault}
        className="min-w-0 text-left disabled:cursor-default"
      >
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-extrabold text-foreground">{label}</span>
          {isDefault && (
            <span className="shrink-0 rounded-lg bg-info-subtle px-2 py-0.5 text-[10.5px] font-bold text-info">
              기본 주소
            </span>
          )}
        </span>
        <span className="mt-1 block text-[13.5px] leading-[1.45] text-foreground">
          {roadAddress}
          {detailAddress ? ` ${detailAddress}` : ''}
        </span>
      </button>
      <span className="text-center text-primary">
        {isDefault ? <Check className="mx-auto h-[18px] w-[18px]" /> : null}
      </span>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`${label} 주소 수정`}
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground transition-colors active:bg-background"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  )
}
