import { useEffect, useState } from 'react'

interface CountdownState {
  remainingMs: number
  isExpired: boolean
  /** MM:SS (예: 23:45) */
  label: string
}

function compute(deadlineMs: number): CountdownState {
  const remainingMs = Math.max(0, deadlineMs - Date.now())
  const totalSec = Math.floor(remainingMs / 1000)
  const mm = Math.floor(totalSec / 60)
  const ss = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return { remainingMs, isExpired: remainingMs <= 0, label: `${pad(mm)}:${pad(ss)}` }
}

/** 픽업 마감까지 남은 시간을 1초마다 갱신해 MM:SS 로 반환 (실시간 카운트다운) */
export function useCountdown(deadline: string | Date): CountdownState {
  const deadlineMs =
    typeof deadline === 'string' ? new Date(deadline).getTime() : deadline.getTime()
  const [state, setState] = useState(() => compute(deadlineMs))

  useEffect(() => {
    const id = setInterval(() => {
      const next = compute(deadlineMs)
      setState(next)
      if (next.isExpired) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [deadlineMs])

  return state
}
