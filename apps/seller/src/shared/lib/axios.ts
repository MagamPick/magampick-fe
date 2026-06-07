import axios, { type InternalAxiosRequestConfig } from 'axios'
import { env } from './env'
import { normalizeError } from './apiError'
import { ROUTES } from './routes'
import { useAuthStore } from '@/features/auth/stores/authStore'

/**
 * 단일 axios 인스턴스 (api-client-convention §2·§4·§5).
 * - baseURL 에 /api/v1 고정 → 도메인 코드는 `/auth/seller/login` 같은 경로만
 * - withCredentials: refresh HttpOnly 쿠키 자동 송수신 (auth.md 듀얼 JWT)
 * - 요청: 메모리 access 토큰 Bearer 자동 첨부
 * - 응답: envelope({success,data}) 자동 unwrap + 401 TOKEN_EXPIRED silent refresh(mutex+큐)
 */
export const apiClient = axios.create({
  baseURL: `${env.VITE_API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (res) => {
    // envelope unwrap — 도메인 코드/Zod 는 data 만 다룬다
    const body = res.data
    if (body && typeof body === 'object' && body.success === true && 'data' in body) {
      res.data = body.data
    }
    return res
  },
  async (error) => {
    const originalRequest = error.config as RetriableConfig | undefined

    // 401 TOKEN_EXPIRED 만 refresh 시도 — INVALID_TOKEN / REFRESH_INVALID / LOGIN_FAILED 는 곧장 거부
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const code = error.response?.data?.error?.code
      if (code === 'TOKEN_EXPIRED') {
        originalRequest._retry = true

        if (isRefreshing) {
          return new Promise((resolve) => {
            refreshQueue.push((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              resolve(apiClient(originalRequest))
            })
          })
        }

        isRefreshing = true
        try {
          // refresh cookie 자동 송신(withCredentials). body 없음. 응답엔 새 access 만.
          const { data } = await apiClient.post('/auth/refresh')
          const newAccessToken = (data as { accessToken: string }).accessToken
          useAuthStore.getState().setAccessToken(newAccessToken)
          refreshQueue.forEach((cb) => cb(newAccessToken))
          refreshQueue = []
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // refresh 자체가 실패(REFRESH_INVALID/만료) → 로그아웃
          useAuthStore.getState().clear()
          window.location.href = ROUTES.LOGIN
          return Promise.reject(normalizeError(refreshError))
        } finally {
          isRefreshing = false
        }
      }
    }

    return Promise.reject(normalizeError(error))
  },
)
