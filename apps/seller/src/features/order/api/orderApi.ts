import { ApiError } from '@/shared/lib/apiError'
import { canTransition } from '../lib/orderStatus'
import type { Order, OrderStatus } from '../types'

/**
 * ⚠️ Mock 스텁 — 주문 BE(order 도메인, BE 완료 NO) 미구현. in-memory 로 상태 유지.
 * 실연동 시 `apiClient` 호출 + Zod 응답 검증으로 교체(api-client-convention).
 * 권한(본인 소유 매장만)은 BE/연동 책임 — mock 은 단일 사장 가정.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** 오늘 날짜의 지정 시각 ISO — 카드가 "오늘 HH:mm" 으로 보이도록 시드. */
function todayAt(hh: number, mm: number): string {
  const d = new Date()
  d.setHours(hh, mm, 0, 0)
  return d.toISOString()
}

/**
 * 데모 시드 — s1(역삼점)에 전 상태 주문, s2(강남점)는 0건(빈 상태 확인용).
 * 프로토타입 owner-v3 ORDERS(o1~o8) + 취소·환불 탭 라벨 검증용 거절/취소/미수령 추가.
 * placedAt 최신순 정렬 확인을 위해 시각을 분산.
 */
function seed(): Order[] {
  return [
    {
      id: 'o1',
      storeId: 's1',
      orderNo: '1024',
      customerName: '빵순이',
      customerPhone: '010-2847-3920',
      placedAt: todayAt(13, 40),
      pickupTime: '14:30',
      pickupCode: '4827',
      status: 'PENDING',
      memo: '덜 익은 빵으로 부탁드려요.',
      items: [
        { name: '버터 크루아상', quantity: 1, price: 3000 },
        { name: '플레인 베이글', quantity: 1, price: 2800 },
        { name: '소금빵', quantity: 1, price: 2600 },
      ],
      total: 8400,
      paymentMethod: '토스페이',
    },
    {
      id: 'o2',
      storeId: 's1',
      orderNo: '1025',
      customerName: '단골손님',
      customerPhone: '010-5391-1147',
      placedAt: todayAt(13, 22),
      pickupTime: '15:00',
      pickupCode: '6310',
      status: 'PENDING',
      memo: '봉투 2개 챙겨주세요.',
      items: [{ name: '우유 식빵', quantity: 1, price: 2750 }],
      total: 2750,
      paymentMethod: '토스페이',
    },
    {
      id: 'o3',
      storeId: 's1',
      orderNo: '1026',
      customerName: '김모닝',
      customerPhone: '010-7124-8842',
      placedAt: todayAt(13, 5),
      pickupTime: '16:30',
      pickupCode: '1985',
      status: 'PENDING',
      items: [
        { name: '소금빵', quantity: 2, price: 2600 },
        { name: '아메리카노', quantity: 1, price: 1000 },
      ],
      total: 6200,
      paymentMethod: '토스페이',
    },
    {
      id: 'o4',
      storeId: 's1',
      orderNo: '1019',
      customerName: '빵빵',
      customerPhone: '010-9402-5521',
      placedAt: todayAt(12, 48),
      pickupTime: '14:00',
      pickupCode: '7204',
      status: 'PREPARING',
      items: [{ name: '치아바타', quantity: 2, price: 3500 }],
      total: 7000,
      paymentMethod: '토스페이',
    },
    {
      id: 'o5',
      storeId: 's1',
      orderNo: '1020',
      customerName: '라라',
      customerPhone: '010-3815-3360',
      placedAt: todayAt(12, 30),
      pickupTime: '14:45',
      pickupCode: '3391',
      status: 'PREPARING',
      memo: '포장 단단히 부탁드려요.',
      items: [{ name: '크루아상', quantity: 3, price: 2000 }],
      total: 6000,
      paymentMethod: '토스페이',
    },
    {
      id: 'o6',
      storeId: 's1',
      orderNo: '1012',
      customerName: '모닝콜',
      customerPhone: '010-6207-7788',
      placedAt: todayAt(12, 5),
      pickupTime: '13:30',
      pickupCode: '5012',
      status: 'READY',
      items: [
        { name: '플레인 베이글', quantity: 1, price: 2800 },
        { name: '딸기잼', quantity: 1, price: 2700 },
      ],
      total: 5500,
      paymentMethod: '토스페이',
    },
    {
      id: 'o7',
      storeId: 's1',
      orderNo: '1003',
      customerName: '해피',
      customerPhone: '010-4530-2210',
      placedAt: todayAt(11, 10),
      pickupTime: '12:00',
      pickupCode: '8830',
      status: 'COMPLETED',
      items: [{ name: '스콘', quantity: 2, price: 2000 }],
      total: 4000,
      paymentMethod: '토스페이',
    },
    {
      id: 'o8',
      storeId: 's1',
      orderNo: '1004',
      customerName: '디저트러버',
      customerPhone: '010-8169-6654',
      placedAt: todayAt(10, 55),
      pickupTime: '11:30',
      pickupCode: '2476',
      status: 'COMPLETED',
      items: [{ name: '레몬 타르트', quantity: 1, price: 3800 }],
      total: 3800,
      paymentMethod: '토스페이',
    },
    {
      id: 'o9',
      storeId: 's1',
      orderNo: '0998',
      customerName: '새벽이',
      customerPhone: '010-2210-7781',
      placedAt: todayAt(10, 20),
      pickupTime: '11:00',
      pickupCode: '4410',
      status: 'REJECTED',
      items: [{ name: '우유 식빵', quantity: 1, price: 2750 }],
      total: 2750,
      paymentMethod: '토스페이',
    },
    {
      id: 'o10',
      storeId: 's1',
      orderNo: '0991',
      customerName: '라떼',
      customerPhone: '010-3380-1102',
      placedAt: todayAt(9, 50),
      pickupTime: '10:30',
      pickupCode: '7765',
      status: 'CANCELLED',
      items: [{ name: '레몬 타르트', quantity: 1, price: 3800 }],
      total: 3800,
      paymentMethod: '토스페이',
    },
    {
      id: 'o11',
      storeId: 's1',
      orderNo: '0985',
      customerName: '바닐라',
      customerPhone: '010-6654-9023',
      placedAt: todayAt(9, 15),
      pickupTime: '10:00',
      pickupCode: '2098',
      status: 'NO_SHOW',
      items: [{ name: '크루아상', quantity: 2, price: 2000 }],
      total: 4000,
      paymentMethod: '토스페이',
    },
  ]
}

let orders: Order[] = seed()

/** 테스트 전용 — 모듈 in-memory 상태 초기화 */
export function resetOrderState() {
  orders = seed()
}

/** 전이 가드 + 상태 적용 공통 — 없으면 404, 정의 안 된 전이면 409. */
function transition(id: string, to: OrderStatus): Order {
  const order = orders.find((o) => o.id === id)
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', '주문을 찾을 수 없어요')
  if (!canTransition(order.status, to)) {
    throw new ApiError(409, 'ORDER_INVALID_TRANSITION', '지금은 변경할 수 없는 상태예요')
  }
  order.status = to
  return { ...order }
}

export const orderApi = {
  /** 매장 주문 목록 — 최신순(placedAt desc). 본인 매장만(mock 단일 사장) */
  async listOrders(storeId: string): Promise<Order[]> {
    await delay(300)
    return orders
      .filter((o) => o.storeId === storeId)
      .sort((a, b) => (a.placedAt < b.placedAt ? 1 : a.placedAt > b.placedAt ? -1 : 0))
      .map((o) => ({ ...o, items: o.items.map((it) => ({ ...it })) }))
  },

  /** 주문 단건 조회 (상세 화면) */
  async getOrder(id: string): Promise<Order> {
    await delay(300)
    const order = orders.find((o) => o.id === id)
    if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', '주문을 찾을 수 없어요')
    return { ...order, items: order.items.map((it) => ({ ...it })) }
  },

  /** 수락 — PENDING → PREPARING (노션 주문 수락/거절) */
  async acceptOrder(id: string): Promise<Order> {
    await delay(400)
    return transition(id, 'PREPARING')
  },

  /** 거절 — PENDING → REJECTED, 자동환불(stub) (노션 주문 수락/거절) */
  async rejectOrder(id: string): Promise<Order> {
    await delay(400)
    return transition(id, 'REJECTED')
  },

  /** 준비완료 — PREPARING → READY, 픽업 코드 안내(노션 주문 상태 변경) */
  async readyOrder(id: string): Promise<Order> {
    await delay(400)
    return transition(id, 'READY')
  },

  /** 수령완료 — READY → COMPLETED, 사장이 픽업 코드 확인 후(노션 주문 상태 변경) */
  async completeOrder(id: string): Promise<Order> {
    await delay(400)
    return transition(id, 'COMPLETED')
  },

  /** 미수령 — READY → NO_SHOW, 수동 처리·환불 없음(노션 주문 상태 변경) */
  async noShowOrder(id: string): Promise<Order> {
    await delay(400)
    return transition(id, 'NO_SHOW')
  },
}
