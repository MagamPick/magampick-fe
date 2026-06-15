import { useLocationReporter } from '../hooks/useLocationReporter'

/**
 * 렌더링 없는 컴포넌트 — 인증 + 주변떨이 ON 시 현재 위치 주기 보고를 트리거한다.
 * App 의 AuthBootstrap 안에 FcmRegistrar 와 나란히 마운트.
 */
export function LocationReporter() {
  useLocationReporter()
  return null
}
