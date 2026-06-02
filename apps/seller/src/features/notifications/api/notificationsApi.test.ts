import { describe, it, expect, beforeEach } from 'vitest'
import { notificationsApi, __resetNotificationsForTest } from './notificationsApi'

describe('notificationsApi (mock, 사장)', () => {
  beforeEach(() => __resetNotificationsForTest())

  describe('list', () => {
    it('세그먼트 없이 최신순 단일 리스트로 반환', async () => {
      const list = await notificationsApi.list()
      expect(list).toHaveLength(7)
      expect(list[0].id).toBe('sn1') // agoMin 5 = 가장 최신
      const times = list.map((n) => n.createdAt)
      expect([...times].sort((a, b) => b.localeCompare(a))).toEqual(times)
    })
  })

  describe('읽음 처리', () => {
    it('미읽음 수는 처음 3건', async () => {
      expect(await notificationsApi.unreadCount()).toBe(3)
    })

    it('단건 읽음 처리하면 미읽음 수가 줄어든다', async () => {
      await notificationsApi.markRead('sn1')
      expect(await notificationsApi.unreadCount()).toBe(2)
    })

    it('모두 읽음 처리하면 미읽음 수가 0', async () => {
      await notificationsApi.markAllRead()
      expect(await notificationsApi.unreadCount()).toBe(0)
    })
  })

  describe('설정', () => {
    it('기본값은 거래·공지 ON, 마케팅 OFF', async () => {
      const settings = await notificationsApi.getSettings()
      expect(settings.newOrder).toBe(true)
      expect(settings.refundRequest).toBe(true)
      expect(settings.newReview).toBe(true)
      expect(settings.notice).toBe(true)
      expect(settings.marketing).toBe(false)
    })

    it('토글하면 변경된 설정을 반환하고 유지된다', async () => {
      const updated = await notificationsApi.updateSetting('marketing', true)
      expect(updated.marketing).toBe(true)
      expect((await notificationsApi.getSettings()).marketing).toBe(true)
    })
  })
})
