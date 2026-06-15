/**
 * H1 단계 placeholder — 이벤트/공지/문의/운영도구 화면은 다음 핸드오프에서 실제 화면으로 교체.
 * 사이드바 네비·라우팅·가드를 먼저 검증하기 위한 빈 자리.
 */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-h2 font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">준비 중입니다.</p>
    </section>
  )
}
