export interface FieldError {
  field: string
  message: string
}

/**
 * 백엔드 ErrorResponse 매핑 (api-client-convention §6). 연동 PR 에서 normalizeError 추가.
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
