import { useNavigate } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import type { KakaoScenario } from '../types'

/**
 * ⚠️ Mock 전용 — 카카오 OAuth 실연동 시 이 파일을 삭제한다.
 *
 * 실제로는 [카카오로 시작하기] 가 카카오 호스팅 화면(`kauth.kakao.com`)으로 리다이렉트되고
 * 카카오가 콜백으로 결과를 돌려준다. mock 엔 그 화면이 없으므로, "카카오 왕복 + BE 콜백" 이
 * 돌려줄 결과(신규/기존/이메일거부/충돌)를 여기서 직접 골라 콜백 화면으로 넘긴다.
 */
const SCENARIOS: { scenario: KakaoScenario; label: string }[] = [
  { scenario: 'new_email', label: '신규·이메일 O' },
  { scenario: 'new_no_email', label: '신규·이메일 X' },
  { scenario: 'existing', label: '기존 회원' },
  { scenario: 'email_conflict', label: '이메일 충돌' },
]

export function KakaoMockScenarios() {
  const navigate = useNavigate()
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border p-3">
      <p className="mb-2 text-[11px] font-bold text-muted-foreground">
        데모 시나리오 <span className="font-medium text-[#bdbdbd]">(mock 전용 · 연동 시 삭제)</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SCENARIOS.map(({ scenario, label }) => (
          <button
            key={scenario}
            type="button"
            onClick={() => navigate(ROUTES.KAKAO_CALLBACK, { state: { scenario } })}
            className="h-9 rounded-lg bg-background text-[12px] font-semibold text-muted-foreground transition active:scale-[0.98]"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
