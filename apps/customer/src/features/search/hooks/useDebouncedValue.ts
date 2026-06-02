import { useEffect, useState } from 'react'

/** 값이 delay(ms) 동안 안 바뀌면 그때 반영 — 자동완성 입력 디바운스용 제네릭 훅. */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
