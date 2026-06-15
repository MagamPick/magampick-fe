import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AxiosError, type AxiosAdapter } from 'axios'
import { apiClient } from './axios'
import { ApiError } from './apiError'
import { useAuthStore } from '@/features/auth/stores/authStore'

// 어댑터를 직접 갈아끼워 네트워크 없이 인터셉터 동작만 검증한다.
const ok = (config: unknown, data: unknown) =>
  ({ data, status: 200, statusText: 'OK', headers: {}, config }) as never

describe('apiClient 인터셉터', () => {
  beforeEach(() => useAuthStore.getState().clear())
  afterEach(() => {
    delete (apiClient.defaults as { adapter?: unknown }).adapter
  })

  it('성공 응답의 envelope({success,data})를 data 로 unwrap', async () => {
    apiClient.defaults.adapter = ((config) =>
      Promise.resolve(ok(config, { success: true, data: { hello: 'world' } }))) as AxiosAdapter
    const res = await apiClient.get('/x')
    expect(res.data).toEqual({ hello: 'world' })
  })

  it('백엔드 에러를 ApiError 로 정규화해 reject', async () => {
    apiClient.defaults.adapter = ((config) =>
      Promise.reject(
        Object.assign(new AxiosError('fail'), {
          config,
          response: { status: 404, data: { error: { code: 'NOT_FOUND', message: '없음' } } },
        }),
      )) as AxiosAdapter
    await expect(apiClient.get('/x')).rejects.toBeInstanceOf(ApiError)
    await expect(apiClient.get('/x')).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 })
  })

  it('TOKEN_EXPIRED 시 refresh 후 원요청을 새 토큰으로 재시도', async () => {
    useAuthStore.getState().setAccessToken('old')
    let protectedCalls = 0
    apiClient.defaults.adapter = ((config: { url?: string }) => {
      if (config.url === '/auth/refresh') {
        return Promise.resolve(ok(config, { success: true, data: { accessToken: 'new-token' } }))
      }
      protectedCalls += 1
      if (protectedCalls === 1) {
        return Promise.reject(
          Object.assign(new AxiosError('expired'), {
            config,
            response: { status: 401, data: { error: { code: 'TOKEN_EXPIRED' } } },
          }),
        )
      }
      return Promise.resolve(ok(config, { success: true, data: { ok: true } }))
    }) as AxiosAdapter

    const res = await apiClient.get('/protected')
    expect(res.data).toEqual({ ok: true })
    expect(useAuthStore.getState().accessToken).toBe('new-token')
  })
})
