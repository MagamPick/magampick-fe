import { toYmd } from '@/shared/lib/date'
import {
  pointDirection,
  pointSummarySchema,
  pointTransactionSchema,
  type PointHistoryFilter,
  type PointSummary,
  type PointTransaction,
} from '../types'

/**
 * ⚠️ Mock 스텁 — point BE 미구현. in-memory 잔액 + 내역 (orderApi 패턴: Map/배열 + delay + Zod).
 * FE 표면 = 잔액·내역 조회 + 결제 시 차감. 적립(픽업완료)·소멸 배치·회수(환불)는 BE 엔진이라
 * 여기선 seed 된 내역으로만 반영(잔액은 결제 사용 시에만 실제 감소).
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

let balance = 2450
const HISTORY: PointTransaction[] = []

function seed(txn: PointTransaction) {
  HISTORY.push(pointTransactionSchema.parse(txn))
}

;(function initSeed() {
  // 노션 사유만: earn(결제 적립)·use(결제 사용)·expire(소멸)·restore(환불 복원)·clawback(적립 회수)
  seed({ id: 'pt1', reason: 'earn', amount: 63, storeName: '스윗아워 디저트', date: '2026-05-28' })
  seed({ id: 'pt2', reason: 'use', amount: 500, storeName: '베이커리 브레드샵', date: '2026-05-22' })
  seed({ id: 'pt3', reason: 'earn', amount: 78, storeName: '데일리 브레드', date: '2026-05-18' })
  seed({ id: 'pt4', reason: 'restore', amount: 500, storeName: '베이커리 브레드샵', date: '2026-05-15' })
  seed({ id: 'pt5', reason: 'earn', amount: 120, storeName: '커피로스터스 합정', date: '2026-05-10' })
  seed({ id: 'pt6', reason: 'clawback', amount: 90, storeName: '카페 모리', date: '2026-05-05' })
  seed({ id: 'pt7', reason: 'expire', amount: 200, storeName: null, date: '2026-04-30' })
  seed({ id: 'pt8', reason: 'earn', amount: 240, storeName: '스윗아워 디저트', date: '2026-04-22' })
})()

export const pointApi = {
  /** 사용 가능 잔액 */
  async getSummary(): Promise<PointSummary> {
    await delay(200)
    return pointSummarySchema.parse({ balance })
  },

  /** 내역 (최신순) — 탭 필터(전체/적립/사용) */
  async listHistory(filter: PointHistoryFilter = 'all'): Promise<PointTransaction[]> {
    await delay(250)
    const sorted = [...HISTORY].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    if (filter === 'all') return sorted
    return sorted.filter((t) => pointDirection(t.reason) === filter)
  },

  /** 결제 시 포인트 사용 — 잔액 차감 + '결제 사용' 내역 추가 */
  async use(amount: number, storeName: string | null = null): Promise<PointSummary> {
    await delay(250)
    if (amount <= 0) return pointSummarySchema.parse({ balance })
    if (amount > balance) throw new Error('보유 포인트보다 많이 사용할 수 없어요.')
    balance -= amount
    HISTORY.push(
      pointTransactionSchema.parse({
        id: `pt_${Date.now()}`,
        reason: 'use',
        amount,
        storeName,
        date: toYmd(new Date()),
      }),
    )
    return pointSummarySchema.parse({ balance })
  },
}
