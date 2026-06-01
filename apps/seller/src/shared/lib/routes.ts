export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  STORE_MANAGE: '/store',
  STORE_HOURS: '/store/hours',

  PRODUCTS: '/products',
  PRODUCT_NEW: '/products/new',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_EDIT: (id: string) => `/products/${id}/edit`,

  // 마감 할인(떨이) — 목록은 /products 세그먼트 탭, 등록/상세만 별도 라우트
  CLEARANCE_NEW: '/clearance/new',
  CLEARANCE_DETAIL: (id: string) => `/clearance/${id}`,

  // 마이 허브 + 내 정보 수정 (바텀네비 없음 — 홈 헤더에서 진입)
  MYPAGE: '/mypage',
  EDIT_PROFILE: '/mypage/edit',
} as const
