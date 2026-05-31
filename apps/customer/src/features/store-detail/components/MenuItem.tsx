import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { Thumbnail } from '@/shared/components/Thumbnail'
import { ROUTES } from '@/shared/lib/routes'
import type { StoreMenuItem } from '../types'

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 메뉴 탭의 일반 상품 행 (정가). 영업 외면 dim. 탭 시 상품 상세로 이동 */
export function MenuItem({ item, orderable }: { item: StoreMenuItem; orderable: boolean }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.PRODUCT_DETAIL('menu', item.id))}
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
