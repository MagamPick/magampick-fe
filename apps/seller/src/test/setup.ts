import '@testing-library/jest-dom'

// jsdom 에는 ResizeObserver 가 없음 — radix(useSize 등) 컴포넌트 테스트용 폴리필
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver
