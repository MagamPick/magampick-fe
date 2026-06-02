import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { useKakaoLogin } from '../hooks/useKakaoLogin'
import type { KakaoScenario } from '../types'

/**
 * 카카오 로그인 콜백 — 카카오 redirect_uri (실연동 후에도 유지되는 우리 화면).
 * mock: 로그인 화면에서 고른 시나리오(location.state)로 분기.
 * 실연동: location.search 의 `?code` 를 BE 로 보내 교환 (mutationFn 만 교체).
 *
 * 성공 분기(기존→홈 / 신규→소셜 가입)는 useKakaoLogin 이 네비게이션.
 * 여기선 진행 중 스피너 + 에러 분기 UI(이메일 재동의 모달 / 이메일 충돌·실패 안내)만 담당.
 */
export function KakaoCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const kakao = useKakaoLogin()
  const scenario = (location.state as { scenario?: KakaoScenario } | null)?.scenario

  useEffect(() => {
    if (!scenario) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    kakao.mutate(scenario)
    // StrictMode(dev)에선 effect 가 2번 실행돼 mutate 도 2번 호출되지만, 결과는 살아있는 observer
    // 한 곳에서만 관찰된다(프로덕션 빌드는 1회). ref 가드를 쓰면 StrictMode 에서 첫 mutation 의
    // observer 가 버려져 스피너에 멈추므로 가드하지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const error = kakao.error instanceof ApiError ? kakao.error : null
  const emailRequired = error?.code === 'KAKAO_EMAIL_REQUIRED'
  const conflict = error?.code === 'EMAIL_ALREADY_REGISTERED'
  const otherError = kakao.isError && !emailRequired && !conflict

  const backToLogin = () => navigate(ROUTES.LOGIN, { replace: true })

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-card px-8 text-center">
      {!kakao.isError && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">카카오 로그인 중…</p>
        </div>
      )}

      {(conflict || otherError) && (
        <div className="flex w-full flex-col items-center gap-3">
          <span className="text-4xl" aria-hidden="true">
            {conflict ? '⚠️' : '😢'}
          </span>
          <p className="text-[15px] font-bold leading-relaxed text-foreground">
            {conflict ? error?.message : '카카오 로그인에 실패했어요'}
          </p>
          <button
            type="button"
            onClick={backToLogin}
            className="mt-2 h-[52px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98]"
          >
            로그인으로 돌아가기
          </button>
        </div>
      )}

      {/* 이메일 동의 거부 → 재동의 유도 모달 (다시 동의하기 / 취소) */}
      <Dialog
        open={emailRequired}
        onOpenChange={(open) => {
          // 사용자가 오버레이/ESC 로 닫으면 취소로 간주 → 로그인 복귀
          if (!open) backToLogin()
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>이메일 동의가 필요합니다</DialogTitle>
            <DialogDescription>
              마감픽 가입에는 카카오 이메일 제공 동의가 필요해요. 다시 동의하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2.5">
            <button
              type="button"
              onClick={backToLogin}
              className="h-[50px] flex-1 rounded-xl bg-background text-[15px] font-bold text-muted-foreground transition active:scale-[0.98]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => kakao.mutate('new_email')}
              className="h-[50px] flex-1 rounded-xl bg-primary text-[15px] font-bold text-white transition active:scale-[0.98]"
            >
              다시 동의하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
