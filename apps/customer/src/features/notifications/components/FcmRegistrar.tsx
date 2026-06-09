import { useFcmRegister } from '../hooks/useFcmRegister'

/** 렌더링 없는 컴포넌트 — 인증 후 FCM 토큰 등록을 트리거한다. App 의 AuthBootstrap 안에 마운트. */
export function FcmRegistrar() {
  useFcmRegister()
  return null
}
