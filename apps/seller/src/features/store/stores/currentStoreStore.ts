import { create } from 'zustand'

interface CurrentStoreState {
  /** 현재 관리 중인 매장 id (계정 1 - 매장 N). 로그인 후 보유 매장 목록 조회 시 첫 매장으로 초기화. */
  selectedStoreId: number | null
  selectStore: (storeId: number) => void
}

/** 헤더 매장 선택기 ↔ 영업 상태 카드/시트가 공유하는 "현재 매장" 전역 상태 */
export const useCurrentStoreStore = create<CurrentStoreState>((set) => ({
  selectedStoreId: null,
  selectStore: (storeId) => set({ selectedStoreId: storeId }),
}))
