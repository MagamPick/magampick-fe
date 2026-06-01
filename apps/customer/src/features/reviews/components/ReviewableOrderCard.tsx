import type { ReviewableOrder } from '../types'

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}.${d.getDate()}`
}

/** 주문 상품 요약 — "{첫 상품} 외 N건" */
function itemsSummary(items: ReviewableOrder['items']) {
  if (items.length === 0) return ''
  return items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`
}

interface Props {
  order: ReviewableOrder
  onWrite: (order: ReviewableOrder) => void
  onView: (order: ReviewableOrder) => void
}

/** 픽업 완료 주문 카드 — 리뷰 작성(미작성) 또는 작성한 리뷰 보기(작성됨) 진입 */
export function ReviewableOrderCard({ order, onWrite, onView }: Props) {
  return (
    <div className="mb-2.5 rounded-[14px] border border-border bg-card p-4">
      <div className="flex items-center gap-[11px]">
        <span className="flex size-[46px] items-center justify-center rounded-[11px] bg-cream text-[20px]">
          {order.storeEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-extrabold">{order.storeName}</p>
          <p className="truncate text-[12.5px] text-muted-foreground">
            {itemsSummary(order.items)}
          </p>
        </div>
        <span className="self-start text-[11.5px] text-[#bdbdbd]">
          {formatDate(order.pickedUpAt)} 픽업
        </span>
      </div>

      {order.reviewed ? (
        <button
          type="button"
          onClick={() => onView(order)}
          className="mt-3 w-full rounded-[10px] border border-border py-2.5 text-[13px] font-bold text-muted-foreground transition active:scale-[0.99]"
        >
          작성한 리뷰 보기
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onWrite(order)}
          className="mt-3 w-full rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white transition active:scale-[0.99]"
        >
          리뷰 작성
        </button>
      )}
    </div>
  )
}
