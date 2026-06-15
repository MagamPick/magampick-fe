import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { ApiError, normalizeError } from './apiError'

describe('normalizeError', () => {
  it('네트워크 에러(response 없음)는 NETWORK_ERROR + status null', () => {
    const result = normalizeError(new AxiosError('Network Error', 'ERR_NETWORK'))
    expect(result).toBeInstanceOf(ApiError)
    expect(result.code).toBe('NETWORK_ERROR')
    expect(result.status).toBeNull()
  })

  it('백엔드 에러 envelope 를 status/code/message/fieldErrors 로 매핑', () => {
    const err = Object.assign(new AxiosError('fail', 'ERR_BAD_REQUEST'), {
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '입력 오류',
            fieldErrors: [{ field: 'email', message: '필수' }],
          },
        },
      },
    })
    const result = normalizeError(err)
    expect(result.status).toBe(400)
    expect(result.code).toBe('INVALID_INPUT')
    expect(result.message).toBe('입력 오류')
    expect(result.fieldErrors).toEqual([{ field: 'email', message: '필수' }])
  })

  it('error 본문 없는 응답은 UNKNOWN + 상태코드 메시지', () => {
    const err = Object.assign(new AxiosError('fail'), { response: { status: 500, data: {} } })
    const result = normalizeError(err)
    expect(result.status).toBe(500)
    expect(result.code).toBe('UNKNOWN')
  })

  it('axios 가 아닌 에러는 UNKNOWN', () => {
    const result = normalizeError(new Error('boom'))
    expect(result).toBeInstanceOf(ApiError)
    expect(result.code).toBe('UNKNOWN')
  })
})
