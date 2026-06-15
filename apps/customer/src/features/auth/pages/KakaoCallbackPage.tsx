import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AlertTriangle, Frown, Loader2 } from 'lucide-react'
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
import { getKakaoRedirectUri, startKakaoLogin } from '../lib/kakao'

/**
 * 카카오 로그인 콜백 — 카카오 Redirect URI 로 등록되는 우리 화면.
 * 카카오가 `?code` 로 돌려보내면(키 없는 로컬에선 dev 우회가 더미 code 를 넘김) 그 code 를 ①에서 쓴
 * redirectUri 와 함께 BE 로 보내 교환한다(useKakaoLogin). 성공 분기(EXISTING→홈 / NEW→소셜 가입)는
 * useKakaoLogin 이 네비게이션하고, 여기선 진행 스피너 + 에러 분기 UI 만 담당한다.
 *
 * 인가코드는 1회용 — StrictMode 2회 실행/새로고침 재교환을 막으려고 ref 가드 + 교환 직전 쿼리 제거.
 */
export function KakaoCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const kakao = useKakaoLogin()
  const didStart = useRef(false)

  useEffect(() => {
    if (didStart.current) return
    didStart.current = true
    const code = searchParams.get('code')
    const kakaoError = searchParams.get('error') // 카카오 동의 취소 등 (access_denied)
    if (kakaoError || !code) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    // 1회용 code 재사용 방지 — 쿼리를 지운 뒤 교환
    navigate(ROUTES.KAKAO_CALLBACK, { replace: true })
    kakao.mutate({ authorizationCode: code, redirectUri: getKakaoRedirectUri() })
    // 최초 1회만 실행 (StrictMode 2회는 ref 가드). searchParams/kakao 는 effect 내부에서만 사용.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const error = kakao.error instanceof ApiError ? kakao.error : null
  const emailRequired = error?.code === 'KAKAO_EMAIL_REQUIRED'
  const conflict = error?.code === 'EMAIL_ALREADY_REGISTERED'
  // SOCIAL_AUTH_FAILED / SOCIAL_TOKEN_INVALID / FORBIDDEN / 네트워크 등은 공통 실패 안내로 (로그인부터 다시)
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
          {conflict
            ? <AlertTriangle className="size-10 text-warning" aria-hidden="true" />
            : <Frown className="size-10 text-muted-foreground" aria-hidden="true" />}
          <p className="text-[15px] font-bold leading-relaxed text-foreground">
            {conflict ? error?.message : '카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.'}
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

      {/* 이메일 동의 거부(KAKAO_EMAIL_REQUIRED) → 재동의 유도 모달. 다시 동의하기 = prompt=consent 로 카카오 재요청 */}
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
              onClick={() => startKakaoLogin(navigate, 'consent')}
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
