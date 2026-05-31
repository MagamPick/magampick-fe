/** 매장 상세 4탭 고정 순서, default = 마감 할인 */
export const STORE_TABS = [
  { key: 'deal', label: '마감 할인' },
  { key: 'menu', label: '메뉴' },
  { key: 'review', label: '리뷰' },
  { key: 'info', label: '정보' },
] as const

export type StoreTabKey = (typeof STORE_TABS)[number]['key']
