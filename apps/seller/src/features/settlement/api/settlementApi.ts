import {
  calcFee,
  calcNet,
  cycleBoundaries,
  depositDateOf,
  formatPeriod,
} from '../lib/settlementCalc'
import type { SettlementCycle, SettlementHalf, SettlementSummary } from '../types'

/**
 * ⚠️ Mock 스텁 — 정산(settlement) BE 미구현. in-memory 로 상태 유지.
 * grossAmount(픽업완료 주문 집계 결과)만 mock — 수수료/정산액/회차/입금일은 settlementCalc 로 real 산출.
 * 송금은 stub(실제 송금 없음) — 현재 회차=정산예정, 직전 회차=입금완료로 상태 전이를 시드로 표현.
 * 권한(본인 소유 매장만)은 BE/연동 책임 — mock 은 단일 사장(s1) 가정. 실연동 시 apiClient + Zod 로 교체.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)

interface Coord {
  year: number
  month: number
  half: SettlementHalf
}

/** 현재 시각 기준 회차 좌표 (1~15일=1차 / 16~말일=2차) */
function currentCoord(now: Date): Coord {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    half: now.getDate() <= 15 ? 1 : 2,
  }
}

/** 직전 회차 좌표 — 2차→1차, 1차→전월 2차, 1월 1차→전년 12월 2차 */
function prevCoord(c: Coord): Coord {
  if (c.half === 2) return { year: c.year, month: c.month, half: 1 }
  if (c.month === 1) return { year: c.year - 1, month: 12, half: 2 }
  return { year: c.year, month: c.month - 1, half: 2 }
}

/** 정렬 키 — 회차를 1년 24슬롯(12월×2반월)으로 단조 증가 매핑 */
function order(c: Pick<SettlementCycle, 'year' | 'month' | 'half'>): number {
  return c.year * 24 + (c.month - 1) * 2 + (c.half - 1)
}

/** 좌표 + 결제액 → 완성된 회차 (수수료/정산액/기간/입금일·상태 = calc real, now 기준) */
function buildCycle(storeId: string, c: Coord, gross: number, now: Date): SettlementCycle {
  const { start, end } = cycleBoundaries(c.year, c.month, c.half)
  const deposit = depositDateOf(c.year, c.month, c.half)
  return {
    id: `st_${c.year}_${c.month}_${c.half}`,
    storeId,
    year: c.year,
    month: c.month,
    half: c.half,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    depositDate: deposit.toISOString(),
    grossAmount: gross,
    feeAmount: calcFee(gross),
    netAmount: calcNet(gross),
    // 입금 예정일이 지났으면 입금완료, 아직이면 정산예정 (송금 stub — 상태 전이만)
    status: deposit.getTime() <= now.getTime() ? 'DEPOSITED' : 'SCHEDULED',
  }
}

/** 데모 시드 결제액 — 현재 회차 + 직전 4회차 (gross 만 mock). */
const SEED_GROSS = [3_037_400, 2_054_000, 2_299_500, 1_903_200, 1_780_600]

function seed(now: Date = new Date()): SettlementCycle[] {
  const cycles: SettlementCycle[] = []
  // 가장 최근 "마감된" 회차부터 — 진행 중 회차는 아직 정산 대상 아님(프로토타입 42-settlement).
  // 최근 마감 회차는 입금 전(정산예정), 그 이전은 입금완료가 된다(buildCycle 가 now 로 판정).
  let coord = prevCoord(currentCoord(now))
  for (let i = 0; i < SEED_GROSS.length; i++) {
    cycles.push(buildCycle('s1', coord, SEED_GROSS[i], now))
    coord = prevCoord(coord)
  }
  return cycles
}

let settlements: SettlementCycle[] = seed()

/** 테스트 전용 — 모듈 in-memory 상태 초기화 */
export function resetSettlementsForTest() {
  settlements = seed()
}

export const settlementApi = {
  /** 매장 정산 회차 목록 — 최신순 desc. 본인 매장만(mock 단일 사장 s1). */
  async listSettlementCycles(storeId: string): Promise<SettlementCycle[]> {
    await delay(300)
    return settlements
      .filter((c) => c.storeId === storeId)
      .sort((a, b) => order(b) - order(a))
      .map((c) => clone(c))
  },

  /** 이번 회차 정산 요약 — 가장 최근(정산예정) 회차. 없으면 null. */
  async getSettlementSummary(storeId: string): Promise<SettlementSummary | null> {
    await delay(300)
    const list = settlements
      .filter((c) => c.storeId === storeId)
      .sort((a, b) => order(b) - order(a))
    // 이번 회차 = 입금 대기(정산예정) 중 가장 최근. 모두 입금완료면 가장 최근 회차.
    const current = list.find((c) => c.status === 'SCHEDULED') ?? list[0]
    if (!current) return null
    return {
      cycleId: current.id,
      periodLabel: formatPeriod(current.year, current.month, current.half),
      netAmount: current.netAmount,
      depositDate: current.depositDate,
      status: current.status,
    }
  },
}
