import { create } from 'zustand'

interface CurrentStoreState {
  /** 현재 관리 중인 매장 id (계정 1 - 매장 N). 기본 's1' 역삼점 */
  selectedStoreId: string
  selectStore: (storeId: string) => void
}

/** 헤더 매장 선택기 ↔ 영업 상태 카드/시트가 공유하는 "현재 매장" 전역 상태 */
export const useCurrentStoreStore = create<CurrentStoreState>((set) => ({
  selectedStoreId: 's1',
  selectStore: (storeId) => set({ selectedStoreId: storeId }),
}))
