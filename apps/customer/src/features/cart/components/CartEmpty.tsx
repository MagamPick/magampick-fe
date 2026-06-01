/** 빈 장바구니 안내 (프로토타입 40-cart cart-empty) */
export function CartEmpty() {
  return (
    <div className="px-5 py-[100px] text-center">
      <div className="text-[56px]" aria-hidden>
        🛒
      </div>
      <p className="mt-4 text-[17px] font-extrabold text-foreground">장바구니가 비었어요</p>
      <p className="mt-2 text-[13px] leading-[1.6] text-muted-foreground">
        홈에서 마음에 드는 마감 할인 상품을
        <br />
        장바구니에 담아 보세요.
      </p>
    </div>
  )
}
