import { Navigate, useNavigate, useParams } from 'react-router'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { PullToRefresh } from '@/shared/components/PullToRefresh'
import { Button } from '@/shared/components/ui/button'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { ErrorState } from '@/shared/components/ErrorState'
import { ROUTES } from '@/shared/lib/routes'
import { productDetailParamsSchema, type ProductKind } from '../types'
import { useProductDetail } from '../hooks/useProductDetail'
import { useProductDetailRefresh } from '../hooks/useProductDetailRefresh'
import { ProductHero } from '../components/ProductHero'
import { StorePreview } from '../components/StorePreview'
import { PriceBlock } from '../components/PriceBlock'
import { DealUrgency } from '../components/DealUrgency'
import { ProductReviewSummary } from '../components/ProductReviewSummary'
import { ProductDescription } from '../components/ProductDescription'
import { PurchaseBar } from '../components/PurchaseBar'

/** 상품 상세 — 라우트 파라미터(kind/productId) 검증 후 ComingSoon Provider 안에서 본문 렌더 */
export function ProductDetailPage() {
  const params = useParams()
  const parsed = productDetailParamsSchema.safeParse(params)
  if (!parsed.success) return <Navigate to={ROUTES.HOME} replace />

  return (
    <ComingSoonProvider>
      <ProductDetailView
        key={`${parsed.data.kind}:${parsed.data.productId}`}
        kind={parsed.data.kind}
        productId={parsed.data.productId}
      />
    </ComingSoonProvider>
  )
}

function ProductDetailView({ kind, productId }: { kind: ProductKind; productId: string }) {
  /** URL 파라미터(string) → BE number ID */
  const productIdNum = Number(productId)
  const navigate = useNavigate()
  const { data: product, isPending, isError, refetch } = useProductDetail(kind, productIdNum)
  const refresh = useProductDetailRefresh(kind, productIdNum)

  const handleBack = () => navigate(-1)

  if (isPending) {
    return (
      <ScreenContainer variant="bleed">
        <ProductHero imageUrl={null} onBack={handleBack} />
        <div className="space-y-3 px-5 pt-5">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-6 w-44 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
      </ScreenContainer>
    )
  }

  if (isError || !product) {
    return (
      <ScreenContainer variant="bleed" className="flex flex-col items-center justify-center">
        <ErrorState onRetry={() => refetch()}>상품 정보를 불러오지 못했어요.</ErrorState>
        <Button variant="outline" onClick={handleBack}>
          뒤로 가기
        </Button>
      </ScreenContainer>
    )
  }

  return (
    <>
      <PullToRefresh onRefresh={refresh}>
        <ScreenContainer variant="bleed" className="pb-[120px]">
          <ProductHero imageUrl={product.imageUrl} onBack={handleBack} />
          <div className="px-5 pb-6 pt-4">
            <StorePreview
              storeName={product.storeName}
              distanceKm={product.distanceKm}
              onTap={() => navigate(ROUTES.STORE_DETAIL(product.storeId))}
            />
            <h1 className="mt-1.5 text-lg font-extrabold leading-[1.4] tracking-[-0.4px]">
              {product.name}
            </h1>
            <PriceBlock product={product} />
            {product.kind === 'deal' && (
              <DealUrgency pickupDeadline={product.pickupDeadline} stockLeft={product.stockLeft} />
            )}
            <ProductReviewSummary
              rating={product.rating}
              reviewCount={product.reviewCount}
              onTap={() => navigate(ROUTES.STORE_DETAIL_REVIEWS(product.storeId))}
            />
            <ProductDescription description={product.description} />
          </div>
        </ScreenContainer>
      </PullToRefresh>
      <PurchaseBar product={product} />
    </>
  )
}
