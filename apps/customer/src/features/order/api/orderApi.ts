import { orderSchema, type Order, type OrderAmounts, type OrderStatus } from '../types'
import type { CartItem, CartStoreInfo, Pickup } from '@/features/cart/types'

/**
 * ⚠️ Mock 스텁 — 주문 BE(order 도메인 미구현)가 아직이라 클라이언트에서 가짜 생성/저장.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const ORDERS = new Map<string, Order>()

function seed(order: Order) {
  ORDERS.set(order.id, orderSchema.parse(order))
}

const BASE_ITEMS: CartItem[] = [
  {
    id: 'item_1',
    kind: 'deal',
    name: '딸기 케이크 1조각',
    imageUrl: null,
    originalPrice: 7000,
    salePrice: 6300,
    qty: 1,
  },
]

;(function initSeed() {
  seed({
    id: 'o_s1',
    orderNo: '1024',
    storeId: 'st1',
    storeName: '스윗아워 디저트',
    storePhone: '02-1234-5678',
    items: BASE_ITEMS,
    pickup: { type: 'slot', time: '18:00' },
    memo: '덜 달게 해주세요',
    amounts: { normalTotal: 7000, discountTotal: 700, payTotal: 6300 },
    pickupCode: '4728',
    status: 'PENDING',
    paymentMethod: 'toss',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  })
  seed({
    id: 'o_s2',
    storeId: 'st2',
    storeName: '베이커리 브레드샵',
    storePhone: '02-9876-5432',
    items: [
      {
        id: 'item_2',
        kind: 'deal',
        name: '크루아상 세트',
        imageUrl: null,
        originalPrice: 5000,
        salePrice: 4500,
        qty: 1,
      },
    ],
    orderNo: '1023',
    pickup: { type: 'slot', time: '18:30' },
    memo: '덜 구운 걸로 부탁드려요',
    amounts: { normalTotal: 5000, discountTotal: 500, payTotal: 4500 },
    pickupCode: '8312',
    status: 'PREPARING',
    paymentMethod: 'toss',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  })
  seed({
    id: 'o_s3',
    orderNo: '1022',
    storeId: 'st3',
    storeName: '데일리 브레드',
    storePhone: '02-5555-1234',
    items: [
      {
        id: 'item_3',
        kind: 'deal',
        name: '호밀 식빵 1봉',
        imageUrl: null,
        originalPrice: 6000,
        salePrice: 5100,
        qty: 1,
      },
    ],
    pickup: { type: 'slot', time: '19:00' },
    memo: '',
    amounts: { normalTotal: 6000, discountTotal: 900, payTotal: 5100 },
    pickupCode: '2941',
    status: 'READY',
    paymentMethod: 'toss',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  })
  seed({
    id: 'o_s4',
    orderNo: '1019',
    storeId: 'st4',
    storeName: '커피로스터스 합정',
    storePhone: '02-3333-7777',
    items: [
      {
        id: 'item_4',
        kind: 'deal',
        name: '시그니처 라떼',
        imageUrl: null,
        originalPrice: 4500,
        salePrice: 3900,
        qty: 2,
      },
    ],
    pickup: { type: 'slot', time: '17:00' },
    memo: '',
    amounts: { normalTotal: 9000, discountTotal: 1200, payTotal: 7800 },
    pickupCode: '6610',
    status: 'COMPLETED',
    paymentMethod: 'toss',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
  })
  seed({
    id: 'o_s5',
    orderNo: '1015',
    storeId: 'st2',
    storeName: '베이커리 브레드샵',
    storePhone: '02-9876-5432',
    items: [
      {
        id: 'item_5',
        kind: 'menu',
        name: '소금빵',
        imageUrl: null,
        originalPrice: 2500,
        salePrice: 2500,
        qty: 3,
      },
    ],
    pickup: { type: 'asap' },
    memo: '',
    amounts: { normalTotal: 7500, discountTotal: 0, payTotal: 7500 },
    pickupCode: '1234',
    status: 'CANCELLED',
    paymentMethod: 'toss',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
  })
})()

export interface CreateOrderInput {
  store: Pick<CartStoreInfo, 'id' | 'name'>
  items: CartItem[]
  pickup: Pickup
  memo: string
  /** 결제 금액 — 쿠폰·포인트·적립 예정 포함 (calcCheckoutAmounts 결과) */
  amounts: OrderAmounts
  paymentKey: string
}

function generatePickupCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export const orderApi = {
  async listOrders(): Promise<Order[]> {
    await delay(300)
    return [...ORDERS.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async getOrder(id: string): Promise<Order> {
    await delay(200)
    const order = ORDERS.get(id)
    if (!order) throw new Error(`주문을 찾을 수 없어요. (id=${id})`)
    return order
  },

  async cancelOrder(id: string): Promise<Order> {
    await delay(300)
    const order = ORDERS.get(id)
    if (!order) throw new Error('주문을 찾을 수 없어요.')
    if (order.status !== 'PENDING') throw new Error('사장님이 수락하기 전에만 취소할 수 있어요.')
    const updated: Order = { ...order, status: 'CANCELLED' as OrderStatus }
    ORDERS.set(id, updated)
    return updated
  },

  async create(input: CreateOrderInput): Promise<Order> {
    await delay(400)
    const order: Order = {
      id: `ord_${Date.now()}`,
      orderNo: String(1000 + ORDERS.size + 1),
      storeId: input.store.id,
      storeName: input.store.name,
      items: input.items,
      pickup: input.pickup,
      memo: input.memo,
      amounts: input.amounts,
      pickupCode: generatePickupCode(),
      status: 'PENDING',
      paymentMethod: 'toss',
      createdAt: new Date().toISOString(),
    }
    const parsed = orderSchema.parse(order)
    ORDERS.set(parsed.id, parsed)
    return parsed
  },
}
