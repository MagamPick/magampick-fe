import { useQuery } from '@tanstack/react-query'
import { storeDetailApi } from '../api/storeDetailApi'

/** 메뉴 탭 — 판매 ON 일반 상품 목록 (카테고리 그룹화는 컴포넌트에서) */
export function useStoreMenu(id: string) {
  return useQuery({
    queryKey: ['store', id, 'menu'],
    queryFn: () => storeDetailApi.getStoreMenu(id),
  })
}
