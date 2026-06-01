/**
 * 이번 달 정산 예정 카드 (프로토타입 24-mypage `.settle-card`).
 * ⚠️ 정산(settlement) 도메인 미구현 — 정적 placeholder 더미값. 연동 시 정산 요약 API 로 교체.
 */
export function SettlementCard() {
  return (
    <div className="mx-5 mt-1 rounded-[16px] bg-[linear-gradient(135deg,#FF8A5C,#FF6B35)] px-5 py-4 text-white shadow-e2">
      <p className="text-[12.5px] font-semibold text-white/85">이번 달 정산 예정 금액</p>
      <p className="mt-1 text-[24px] font-extrabold tracking-[-0.4px]">₩2,840,000</p>
      <p className="mt-1 text-[12px] font-medium text-white/75">입금 예정일 · 6월 10일</p>
    </div>
  )
}
