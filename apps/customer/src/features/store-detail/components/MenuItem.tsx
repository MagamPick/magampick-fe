import { cn } from '@/shared/lib/utils'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import type { StoreMenuItem } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 메뉴 탭의 일반 상품 행 (정가). 영업 외면 dim + 담기 차단 안내 */
export function MenuItem({ item, orderable }: { item: StoreMenuItem; orderable: boolean }) {
  const { show } = useComingSoon()
  const handleTap = () =>
    show(orderable ? '상품 상세는 준비 중이에요.' : '지금은 주문할 수 없는 매장이에요.')

  return (
    <button
      type="button"
      onClick={handleTap}
      className={cn(
        'flex w-full items-center gap-3 border-b border-border py-[13px] text-left last:border-b-0',
        !orderable && 'opacity-60',
      )}
    >
      <Thumbnail
        src={item.imageUrl}
        className="size-[66px] flex-shrink-0 rounded-[12px]"
        iconClassName="size-8"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{item.name}</span>
        <span className="mt-[5px] block text-sm font-extrabold">{won(item.price)}</span>
      </span>
    </button>
  )
}
