/** Date → 'YYYY-MM-DD' (로컬 기준). 만료일·발생일 문자열 비교/표기에 사용. */
export function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 오늘 'YYYY-MM-DD' (로컬) */
export function todayYmd(): string {
  return toYmd(new Date())
}
