/**
 * 운영 도구 도메인 API — 실연동. (정산 배치 수동 트리거 + SMS 발송 mock 전환)
 * 참조 패턴: events eventApi (apiClient + Zod 응답 검증).
 * 에러 정규화 / envelope unwrap 은 apiClient interceptor 가 처리.
 * 스펙 소스: BE 계약(노션 기능명세 없는 보너스 BE) — magampick_docs working/admin/admin-screens.md §2-5·§3.
 */
import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'

/** POST /admin/settlements/process 응답 — 처리된 정산 건수. (BE ProcessSettlementResponse) */
const processSettlementResponseSchema = z.object({ processedCount: z.number() })
export type ProcessSettlementResult = z.infer<typeof processSettlementResponseSchema>

export const opsApi = {
  /**
   * POST /admin/settlements/process — 정산 배치 수동 실행.
   * targetDate("yyyy-MM-dd") 미지정이면 빈 body({}) → 서버가 오늘로 처리. 200 {processedCount}(0건도 정상).
   */
  async processSettlement(targetDate?: string): Promise<ProcessSettlementResult> {
    const body = targetDate ? { targetDate } : {}
    const res = await apiClient.post('/admin/settlements/process', body)
    return processSettlementResponseSchema.parse(res.data)
  },

  /**
   * POST /admin/sms/mock?enabled=(boolean) — SMS 발송기 mock/실발송 전환. 200 void.
   * ⚠ 상태 조회(GET) 없음 — set 만. mock=false 로 시작한 서버에서만 전환 가능(아니면 BE 에러).
   */
  async setSmsMock(enabled: boolean): Promise<void> {
    await apiClient.post('/admin/sms/mock', null, { params: { enabled } })
  },
}
