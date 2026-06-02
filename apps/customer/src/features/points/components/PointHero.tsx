/** 포인트 잔액 Hero (프로토타입 `.pt-hero`) — 오렌지 그라데이션 카드 */
export function PointHero({ balance }: { balance: number }) {
  return (
    <div className="mx-5 mt-4 rounded-[18px] bg-gradient-to-br from-[#FF8B5A] to-primary px-[22px] pb-6 pt-[22px] text-white shadow-[0_8px_22px_rgba(255,107,53,0.22)]">
      <p className="text-[12.5px] font-bold text-white/90">사용 가능한 포인트</p>
      <p className="mt-1.5 text-[32px] font-extrabold tabular-nums tracking-[-0.5px]">
        <span className="text-[38px]">{balance.toLocaleString('ko-KR')}</span> P
      </p>
      <p className="mt-2.5 text-[11.5px] font-semibold text-white/85">
        1P = 1원 · 결제 시 사용할 수 있어요
      </p>
    </div>
  )
}
