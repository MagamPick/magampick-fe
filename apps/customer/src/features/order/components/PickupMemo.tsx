import { Textarea } from '@/shared/components/ui/textarea'

const MEMO_MAX = 80
const QUICK_NOTES = ['포장 부탁드려요', '시간 변동 가능', '직접 수령할게요']

/** 픽업 요청 메모 (사장 전달용, ≤80자, 선택) — 빠른 문구 칩 + 글자수 카운터 */
export function PickupMemo({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const setValue = (next: string) => onChange(next.slice(0, MEMO_MAX))

  return (
    <div className="mt-3">
      <label htmlFor="pickup-memo" className="mb-1.5 block text-[13px] font-bold text-foreground">
        사장님께 전달
        <span className="ml-1 text-xs font-semibold text-muted-foreground">(선택)</span>
      </label>
      <Textarea
        id="pickup-memo"
        value={value}
        rows={2}
        maxLength={MEMO_MAX}
        onChange={(e) => setValue(e.target.value)}
        placeholder="예) 초콜릿 빼주세요 / 포장 잘 부탁드려요"
      />
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {QUICK_NOTES.map((note) => (
            <button
              key={note}
              type="button"
              onClick={() => setValue(note)}
              className="min-h-8 flex-shrink-0 whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground"
            >
              {note}
            </button>
          ))}
        </div>
        <span
          data-slot="memo-count"
          className="flex-shrink-0 text-[11px] font-semibold text-[#bdbdbd] tabular-nums"
        >
          <b className="font-bold text-muted-foreground">{value.length}</b>/{MEMO_MAX}
        </span>
      </div>
    </div>
  )
}
