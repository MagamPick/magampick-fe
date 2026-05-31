import type { StoreDetail } from '../types'

/** 정보 탭 — 주소 · 전화 · 요일별 영업시간(휴무 표시) · 사업자 등록 번호 */
export function InfoTab({ store }: { store: StoreDetail }) {
  return (
    <div className="px-5">
      <InfoRow label="주소" value={store.address} />
      <InfoRow label="전화" value={store.phone} />
      <div className="flex gap-3 border-b border-border py-[11px] text-sm">
        <span className="w-[72px] flex-shrink-0 font-semibold text-muted-foreground">영업시간</span>
        <div className="space-y-1 font-semibold">
          {store.operatingHours.map((hour) => (
            <div key={hour.day} className="flex gap-2">
              <span className="w-6 text-muted-foreground">{hour.day}</span>
              <span className={hour.closed ? 'text-muted-foreground' : undefined}>
                {hour.closed ? '휴무' : `${hour.open} – ${hour.close}`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <InfoRow label="사업자" value={store.businessNumber} />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-border py-[11px] text-sm last:border-b-0">
      <span className="w-[72px] flex-shrink-0 font-semibold text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
