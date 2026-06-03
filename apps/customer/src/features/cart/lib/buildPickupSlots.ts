const SLOT_MINUTES = 15

/**
 * 픽업 시간 슬롯 — now 이후 다음 15분 경계부터 매장 마감(포함)까지 15분 단위.
 * "가능한 빨리(ASAP)" 는 호출측에서 항상 별도 제공하므로 여기엔 포함하지 않는다.
 *
 * @param closingTime 매장 마감 시각 "HH:mm"
 * @param nowMs 기준 시각(ms) — 로컬 시각 기준. 렌더 순수성 위해 주입.
 * @returns ["HH:mm", ...] (마감 임박/지남 또는 잘못된 입력이면 빈 배열)
 */
export function buildPickupSlots(closingTime: string, nowMs: number): string[] {
  const close = parseHm(closingTime)
  if (close == null) return []

  const now = new Date(nowMs)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  // 현재 분 "초과" 다음 15분 경계로 올림 (정각이어도 현재 슬롯은 ASAP 영역이라 제외)
  let slot = Math.ceil((nowMin + 1) / SLOT_MINUTES) * SLOT_MINUTES

  const slots: string[] = []
  for (; slot <= close; slot += SLOT_MINUTES) {
    slots.push(formatHm(slot))
  }
  return slots
}

/** "HH:mm" → 자정 기준 분. 형식/범위 어긋나면 null */
function parseHm(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

/** 자정 기준 분 → "HH:mm" */
function formatHm(total: number): string {
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
