import { useRef, useState, type TouchEvent } from 'react'

interface Options {
  /** 새로고침을 트리거할 당김 거리(px) */
  threshold?: number
  /** 스크롤 최상단 여부 (기본: 문서 스크롤 window.scrollY) */
  isAtTop?: () => boolean
}

/**
 * 모바일 당겨서 새로고침 — 스크롤 최상단에서 아래로 당기면 onRefresh.
 * 데스크탑(터치 없음)에선 자연히 비활성. 당김 거리에 저항(×0.5)을 줘 과도한 늘어남 방지.
 * TabLayout 이 문서(window) 스크롤이라 기본 isAtTop 은 window.scrollY 로 판단.
 */
export function usePullToRefresh(onRefresh: () => Promise<unknown>, options: Options = {}) {
  const threshold = options.threshold ?? 70
  const atTop =
    options.isAtTop ?? (() => (typeof window === 'undefined' ? true : window.scrollY <= 0))
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pull = useRef(0)

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    if (isRefreshing) return
    if (!atTop()) {
      startY.current = null
      return
    }
    startY.current = e.touches[0].clientY
  }

  const onTouchMove = (e: TouchEvent<HTMLElement>) => {
    if (startY.current === null || isRefreshing) return
    const dy = e.touches[0].clientY - startY.current
    if (dy <= 0) {
      pull.current = 0
      setPullDistance(0)
      return
    }
    const dist = Math.min(dy * 0.5, threshold * 1.5)
    pull.current = dist
    setPullDistance(dist)
  }

  const onTouchEnd = async () => {
    if (startY.current === null || isRefreshing) return
    const shouldRefresh = pull.current >= threshold
    startY.current = null
    if (!shouldRefresh) {
      pull.current = 0
      setPullDistance(0)
      return
    }
    setIsRefreshing(true)
    setPullDistance(threshold)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      pull.current = 0
      setPullDistance(0)
    }
  }

  return { pullDistance, isRefreshing, handlers: { onTouchStart, onTouchMove, onTouchEnd } }
}
