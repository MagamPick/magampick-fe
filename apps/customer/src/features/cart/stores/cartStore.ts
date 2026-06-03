import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CART_QTY_MAX, CART_QTY_MIN, type CartItem, type CartStoreInfo, type Pickup } from '../types'

/**
 * 장바구니 스토어 (노션: 장바구니 관리 — 클라이언트 로컬 상태).
 * localStorage 영구 저장(서버 미저장, 다기기 동기화 비범위). 단일 매장 정책.
 * 단일 매장 가드: 다른 매장 담기는 UI(PurchaseBar)가 확인 시트로 한 번 막은 뒤 호출 →
 * addItem 의 "교체" 분기는 확인 이후 경로다.
 */

const ASAP: Pickup = { type: 'asap' }

const clampQty = (n: number) => Math.min(CART_QTY_MAX, Math.max(CART_QTY_MIN, Math.trunc(n)))

export interface AddItemPayload {
  store: CartStoreInfo
  item: Omit<CartItem, 'qty'>
  qty: number
}

interface CartState {
  store: CartStoreInfo | null
  items: CartItem[]
  pickup: Pickup

  addItem: (payload: AddItemPayload) => void
  updateQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  setPickup: (pickup: Pickup) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      store: null,
      items: [],
      pickup: ASAP,

      addItem: ({ store, item, qty }) =>
        set((s) => {
          // 단일 매장 정책 — 다른 매장이면 비우고 새로 담음(픽업 초기화)
          if (s.store && s.store.id !== store.id) {
            return { store, items: [{ ...item, qty: clampQty(qty) }], pickup: ASAP }
          }
          const existing = s.items.find((i) => i.id === item.id)
          const items = existing
            ? s.items.map((i) => (i.id === item.id ? { ...i, qty: clampQty(i.qty + qty) } : i))
            : [...s.items, { ...item, qty: clampQty(qty) }]
          return { store, items }
        }),

      updateQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, qty: clampQty(qty) } : i)),
        })),

      removeItem: (id) =>
        set((s) => {
          const items = s.items.filter((i) => i.id !== id)
          // 비면 매장 컨텍스트·픽업 선택도 초기화
          return items.length > 0 ? { items } : { items, store: null, pickup: ASAP }
        }),

      clearCart: () => set({ items: [], store: null, pickup: ASAP }),

      setPickup: (pickup) => set({ pickup }),
    }),
    { name: 'magampick-cart' },
  ),
)

/** 전체 수량 합 — selector */
export const selectCartCount = (s: CartState) => s.items.reduce((sum, i) => sum + i.qty, 0)

/** 컴포넌트용 — 장바구니 전체 수량 구독 */
export const useCartCount = () => useCartStore(selectCartCount)
