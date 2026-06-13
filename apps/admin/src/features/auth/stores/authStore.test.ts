import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => useAuthStore.getState().clear())

  it('setAccessToken_은_토큰을_저장하고_인증상태를_true로_만든다', () => {
    useAuthStore.getState().setAccessToken('admin-token')
    expect(useAuthStore.getState().accessToken).toBe('admin-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('clear_는_토큰을_비우고_인증상태를_false로_만든다', () => {
    useAuthStore.getState().setAccessToken('admin-token')
    useAuthStore.getState().clear()
    expect(useAuthStore.getState().accessToken).toBe(null)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('User_객체_상태가_없다_admin은_프로필조회_EP가_없다', () => {
    expect('user' in useAuthStore.getState()).toBe(false)
  })
})
