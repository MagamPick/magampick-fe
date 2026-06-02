import { describe, it, expect, beforeEach } from 'vitest'
import { notificationsApi, __resetNotificationsForTest } from './notificationsApi'

describe('notificationsApi (mock)', () => {
  beforeEach(() => __resetNotificationsForTest())

  describe('list', () => {
    it('전체는 최신순으로 모두 반환', async () => {
      const list = await notificationsApi.list('all')
      expect(list).toHaveLength(9)
      expect(list[0].id).toBe('n1') // agoMin 0 = 가장 최신
      // 최신순(createdAt 내림차순) 보장
      const times = list.map((n) => n.createdAt)
      expect([...times].sort((a, b) => b.localeCompare(a))).toEqual(times)
    })

    it('마감 할인 세그먼트는 deal 만', async () => {
      const list = await notificationsApi.list('deal')
      expect(list.map((n) => n.id)).toEqual(['n1', 'n3'])
      expect(list.every((n) => n.category === 'deal')).toBe(true)
    })

    it('주문 세그먼트는 order 만', async () => {
      const list = await notificationsApi.list('order')
      expect(list.map((n) => n.id)).toEqual(['n2', 'n4', 'n7'])
    })
  })

  describe('읽음 처리', () => {
    it('미읽음 수는 처음 5건', async () => {
      expect(await notificationsApi.unreadCount()).toBe(5)
    })

    it('단건 읽음 처리하면 미읽음 수가 줄어든다', async () => {
      await notificationsApi.markRead('n1')
      expect(await notificationsApi.unreadCount()).toBe(4)
      const list = await notificationsApi.list('all')
      expect(list.find((n) => n.id === 'n1')?.read).toBe(true)
    })

    it('모두 읽음 처리하면 미읽음 수가 0', async () => {
      await notificationsApi.markAllRead()
      expect(await notificationsApi.unreadCount()).toBe(0)
    })
  })

  describe('설정', () => {
    it('기본값은 거래·리뷰 ON, 광고성 OFF', async () => {
      const settings = await notificationsApi.getSettings()
      expect(settings.nearbyDeal).toBe(true)
      expect(settings.orderRefund).toBe(true)
      expect(settings.reviewReply).toBe(true)
      expect(settings.eventBenefit).toBe(false)
      expect(settings.marketing).toBe(false)
    })

    it('토글하면 변경된 설정을 반환하고 유지된다', async () => {
      const updated = await notificationsApi.updateSetting('marketing', true)
      expect(updated.marketing).toBe(true)
      expect((await notificationsApi.getSettings()).marketing).toBe(true)
    })
  })
})
