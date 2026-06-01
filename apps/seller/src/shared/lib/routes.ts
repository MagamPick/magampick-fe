export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  STORE_MANAGE: '/store',
  STORE_HOURS: '/store/hours',

  PRODUCTS: '/products',
  PRODUCT_NEW: '/products/new',

  // 마이 허브 + 내 정보 수정 (바텀네비 없음 — 홈 헤더에서 진입)
  MYPAGE: '/mypage',
  EDIT_PROFILE: '/mypage/edit',
} as const
