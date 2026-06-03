import { z } from 'zod'
import { Navigate, useNavigate, useParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ROUTES } from '@/shared/lib/routes'
import { ErrorState } from '@/shared/components/ErrorState'
import { useProduct } from '../hooks/useProduct'
import { ProductForm } from '../components/ProductForm'

const paramsSchema = z.object({ id: z.string().min(1) })

/** 일반 상품 수정 — 상품 로드 후 등록 폼을 수정 모드로 재사용 (노션: 일반 상품 수정/삭제). */
export function ProductEditPage() {
  const navigate = useNavigate()
  const params = useParams()
  const parsed = paramsSchema.safeParse(params)
  const id = parsed.success ? parsed.data.id : ''
  const { data: product, isLoading, isError, refetch } = useProduct(id)

  if (!parsed.success) return <Navigate to={ROUTES.HOME} replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">상품 수정</h1>
      </header>

      {isLoading && (
        <p className="py-16 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
      )}
      {!isLoading && (isError || !product) && (
        <ErrorState onRetry={() => refetch()}>상품을 찾을 수 없어요.</ErrorState>
      )}
      {product && <ProductForm mode="edit" product={product} />}
    </div>
  )
}
