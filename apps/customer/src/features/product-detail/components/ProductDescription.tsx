/** 상품 설명 — 있으면 표시(선택 필드) */
export function ProductDescription({ description }: { description: string | null }) {
  if (!description) return null
  return (
    <>
      <h2 className="mb-2 mt-[22px] text-sm font-extrabold">상품 설명</h2>
      <p className="whitespace-pre-line text-sm leading-[1.65] text-foreground">{description}</p>
    </>
  )
}
