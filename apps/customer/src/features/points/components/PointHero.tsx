/** 포인트 잔액 Hero (프로토타입 `.pt-hero`) — 오렌지 그라데이션 카드 */
export function PointHero({
  balance,
  pendingPoints = 0,
}: {
  balance: number
  /** 적립 예정(아직 사용 불가) — 환불 윈도우(3일) 종료 후 확정. 0이면 미표시 */
  pendingPoints?: number
}) {
  return (
    <div className="mx-5 mt-4 rounded-[18px] bg-gradient-to-br from-[#FF8B5A] to-primary px-[22px] pb-6 pt-[22px] text-white shadow-[0_8px_22px_rgba(255,107,53,0.22)]">
      <p className="text-[12.5px] font-bold text-white/90">사용 가능한 포인트</p>
      <p className="mt-1.5 text-[32px] font-extrabold tabular-nums tracking-[-0.5px]">
        <span className="text-[38px]">{balance.toLocaleString('ko-KR')}</span> P
      </p>
      <p className="mt-2.5 text-[11.5px] font-semibold text-white/85">
        1P = 1원 · 결제 시 사용할 수 있어요
      </p>

      {/* 적립 예정 — 사용 가능 잔액과 분리. 픽업완료 3일 후 확정·사용 가능 */}
      {pendingPoints > 0 && (
        <div className="mt-3.5 flex items-center justify-between rounded-[12px] bg-white/15 px-3.5 py-2.5">
          <div>
            <p className="text-[12px] font-bold text-white/95">적립 예정</p>
            <p className="mt-0.5 text-[10.5px] font-semibold text-white/75">3일 후 사용 가능</p>
          </div>
          <p className="text-[15px] font-extrabold tabular-nums text-white">
            +{pendingPoints.toLocaleString('ko-KR')} P
          </p>
        </div>
      )}
    </div>
  )
}
