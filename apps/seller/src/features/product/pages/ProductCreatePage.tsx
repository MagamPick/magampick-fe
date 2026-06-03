import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { ProductForm } from '../components/ProductForm'

/** 일반 상품 등록 — 헤더 + 등록 폼(셸). 폼이 CTA·제출·이동을 담당. */
export function ProductCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.PRODUCTS)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">상품 등록</h1>
      </header>

      <ProductForm />
    </div>
  )
}
