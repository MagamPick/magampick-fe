import { ApiError } from '@/shared/lib/apiError'
import { FAVORITE_ERROR } from '../types'

/** 단골 토글 실패 시 사용자 안내 문구 — 상한 초과는 서버 메시지, 그 외 일반 안내 */
export function favoriteErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.code === FAVORITE_ERROR.LIMIT_REACHED) return err.message
  return '잠시 후 다시 시도해주세요.'
}
