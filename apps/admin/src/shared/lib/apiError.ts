import axios from 'axios'

export interface FieldError {
  field: string
  message: string
}

/**
 * 백엔드 ErrorResponse 매핑 (api-client-convention §6).
 * tsconfig 의 erasableSyntaxOnly 때문에 생성자 parameter properties 대신 필드 선언 방식 사용.
 */
export class ApiError extends Error {
  readonly status: number | null
  readonly code: string
  readonly fieldErrors?: FieldError[]

  constructor(
    status: number | null,
    code: string,
    message: string,
    fieldErrors?: FieldError[],
    cause?: unknown,
  ) {
    super(message, cause !== undefined ? { cause } : undefined)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

/**
 * axios 에러 / 미지 에러를 ApiError 로 정규화 (api-client-convention §6).
 * - 네트워크(응답 없음) → NETWORK_ERROR
 * - 백엔드 envelope({error:{code,message,fieldErrors}}) → 그대로 매핑
 * - 그 외 → UNKNOWN
 */
export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(null, 'NETWORK_ERROR', '네트워크 연결을 확인해주세요', undefined, error)
    }
    const { status, data } = error.response
    const backendError = (
      data as { error?: { code?: string; message?: string; fieldErrors?: FieldError[] } } | undefined
    )?.error
    return new ApiError(
      status,
      backendError?.code ?? 'UNKNOWN',
      backendError?.message ?? `서버 오류 (${status})`,
      backendError?.fieldErrors,
      error,
    )
  }
  return new ApiError(null, 'UNKNOWN', '알 수 없는 오류', undefined, error)
}
