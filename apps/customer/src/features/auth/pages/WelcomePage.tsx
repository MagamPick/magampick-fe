import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Gift, PartyPopper } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { useAuthStore } from '../stores/authStore'

export function WelcomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const state = location.state as { accessToken?: string; nickname?: string } | null
  const accessToken = state?.accessToken
  const nickname = state?.nickname

  // 가입 직후 도착 시 자동 로그인 (가입 페이지 가드 가로채기 회피 위해 여기서 토큰 저장)
  useEffect(() => {
    if (accessToken) setAccessToken(accessToken)
  }, [accessToken, setAccessToken])

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-card px-5 pb-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-[22px] flex size-24 items-center justify-center rounded-full bg-gradient-to-b from-[#FF8A5C] to-primary shadow-[0_14px_30px_rgba(255,107,53,0.32)]">
          <PartyPopper className="size-10 text-white" aria-hidden />
        </div>
        <h1 className="text-[23px] font-extrabold leading-snug tracking-tight text-foreground">
          환영합니다,
          <br />
          {nickname ? `${nickname} 님!` : '마감픽 회원님!'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          이제 내 주변 마감 세일을 픽할 수 있어요.
          <br />첫 주문에 쓸 수 있는 쿠폰을 드렸어요.
        </p>
        <div className="mt-8 flex w-full items-center gap-3.5 rounded-2xl bg-gradient-to-b from-secondary to-[#FFD9C7] p-[18px] text-left">
          <Gift className="size-9 shrink-0 text-secondary-foreground" aria-hidden />
          <span className="flex min-w-0 flex-col">
            <span className="text-xs font-bold text-secondary-foreground">신규 가입 축하 쿠폰</span>
            <span className="mt-0.5 text-lg font-extrabold text-secondary-foreground">
              첫 주문 30% 할인
            </span>
            <span className="mt-0.5 text-[11.5px] text-[#b5764e]">
              마이 &gt; 쿠폰함에서 확인할 수 있어요
            </span>
          </span>
        </div>
      </div>
      <Button
        onClick={() => navigate(ROUTES.HOME)}
        className="h-[54px] w-full rounded-xl text-base font-bold tracking-[-0.3px]"
      >
        마감픽 시작하기
      </Button>
    </main>
  )
}
