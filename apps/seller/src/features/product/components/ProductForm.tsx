import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Switch } from '@/shared/components/ui/switch'
import { cn } from '@/shared/lib/utils'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useCreateProduct } from '../hooks/useCreateProduct'
import { useUpdateProduct } from '../hooks/useUpdateProduct'
import { PRODUCT_CATEGORIES, createProductInputSchema } from '../types'
import type { CreateProductInput, Product, ProductCategory } from '../types'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

interface Props {
  /** 'edit' + product 면 수정 모드 (프리필 + 변경 저장), 기본은 등록 모드 */
  mode?: 'create' | 'edit'
  product?: Product
}

/**
 * 일반 상품 등록/수정 공용 폼 (노션: 일반 상품 등록 / 수정·삭제).
 * 등록: 현재 매장에 생성 → 목록으로. 수정: 기존 상품 프리필 → 변경 저장 → 상세로.
 * 사진은 로컬 dataURL — 수정 시 새로 고르지 않으면 기존 사진 유지(미전송).
 */
export function ProductForm({ mode = 'create', product }: Props) {
  const navigate = useNavigate()
  const storeId = useCurrentStoreStore((s) => s.selectedStoreId)
  const isEdit = mode === 'edit' && !!product

  const create = useCreateProduct(storeId)
  const update = useUpdateProduct(product?.id ?? '', storeId)
  const mutation = isEdit ? update : create

  const fileInputRef = useRef<HTMLInputElement>(null)
  // 새로 고른 사진 dataURL (수정 시 미선택이면 null → 기존 사진 유지)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const previewUrl = imageDataUrl ?? product?.imageUrl ?? null

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductInputSchema),
    mode: 'onChange',
    defaultValues: isEdit
      ? {
          name: product.name,
          category: product.category,
          price: String(product.price),
          description: product.description ?? '',
          onSale: product.onSale,
        }
      : {
          name: '',
          category: '' as ProductCategory,
          price: '',
          description: '',
          onSale: true,
        },
  })

  // 수정 모드: 프리필 값이 유효하면 마운트 시 저장 버튼이 바로 활성화되도록 검증 트리거
  useEffect(() => {
    if (isEdit) void form.trigger()
  }, [isEdit, form])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 허용
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('이미지 파일만 올릴 수 있어요')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('5MB 이하 이미지만 올릴 수 있어요')
      return
    }
    setImageError(null)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setImageDataUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function onSubmit(values: CreateProductInput) {
    const description = values.description?.trim()
    const payload = {
      name: values.name,
      category: values.category,
      price: Number(values.price),
      description: description || undefined,
      onSale: values.onSale,
      imageDataUrl: imageDataUrl ?? undefined,
    }
    if (isEdit) {
      update.mutate(payload, {
        onSuccess: () => navigate(ROUTES.PRODUCT_DETAIL(product.id)),
      })
    } else {
      create.mutate(payload, { onSuccess: () => navigate(ROUTES.PRODUCTS) })
    }
  }

  const serverError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? '저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
        : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col">
        <div className="flex-1 px-5 pt-4 pb-6">
          {/* 사진 업로드 (선택) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={previewUrl ? '상품 사진 변경' : '상품 사진 등록'}
            className={cn(
              'relative mb-5 flex h-[168px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[14px] border-[1.5px] border-dashed border-border bg-background text-muted-foreground',
              previewUrl && 'border-solid border-primary',
            )}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="상품 사진 미리보기"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <>
                <span className="text-[34px]">📷</span>
                <span className="text-[13.5px] font-semibold">상품 사진 등록</span>
                <span className="text-[12px]">정사각형 사진을 권장해요</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {imageError && (
            <p role="alert" className="-mt-3 mb-4 text-[13px] font-medium text-destructive">
              {imageError}
            </p>
          )}

          {/* 상품명 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>
                  상품명<span className="ml-0.5 text-primary">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="예) 버터 크루아상" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 카테고리 */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>
                  카테고리<span className="ml-0.5 text-primary">*</span>
                </FormLabel>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map((cat) => {
                    const selected = field.value === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => field.onChange(cat)}
                        className={cn(
                          'inline-flex items-center rounded-[20px] border-[1.5px] px-[15px] py-[11px] text-[14px] transition',
                          selected
                            ? 'border-primary bg-secondary font-bold text-secondary-foreground'
                            : 'border-border bg-card text-foreground',
                        )}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 정상가 */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>
                  정상가<span className="ml-0.5 text-primary">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="text" inputMode="numeric" placeholder="예) 4000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 상품 설명 (선택) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>상품 설명</FormLabel>
                <FormControl>
                  <Textarea placeholder="상품 소개를 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 판매 상태 토글 */}
          <FormField
            control={form.control}
            name="onSale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>판매 상태</FormLabel>
                <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3.5">
                  <span className="text-[14px] font-bold text-foreground">
                    {isEdit ? '판매 중' : '등록 즉시 판매 시작'}
                  </span>
                  <FormControl>
                    <Switch
                      aria-label={isEdit ? '판매 상태' : '등록 즉시 판매 시작'}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          {serverError && (
            <p role="alert" className="mt-4 text-[13px] font-medium text-destructive">
              {serverError}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="border-t border-border bg-card px-5 py-3">
          <button
            type="submit"
            disabled={!form.formState.isValid || mutation.isPending}
            className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-[#f0d9ce] disabled:active:scale-100"
          >
            {isEdit
              ? mutation.isPending
                ? '저장 중…'
                : '변경 저장'
              : mutation.isPending
                ? '등록 중…'
                : '상품 등록'}
          </button>
        </div>
      </form>
    </Form>
  )
}
