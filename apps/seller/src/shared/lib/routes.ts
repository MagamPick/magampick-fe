export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // 주문(바텀네비 탭) + 주문 상세(풀스크린, 바텀네비 없음)
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ANALYTICS: '/analytics',

  STORE_MANAGE: '/store',
  STORE_HOURS: '/store/hours',

  PRODUCTS: '/products',
  PRODUCT_NEW: '/products/new',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_EDIT: (id: string) => `/products/${id}/edit`,

  // 마감 할인(떨이) — 목록은 /products 세그먼트 탭, 등록/상세만 별도 라우트
  CLEARANCE_NEW: '/clearance/new',
  CLEARANCE_DETAIL: (id: string) => `/clearance/${id}`,

  // 리뷰 관리 (마이 허브·홈에서 진입)
  REVIEWS: '/reviews',

  // 환불 관리 (마이 허브에서 진입 — 환불 요청 승인/거부)
  REFUNDS: '/refunds',

  // 마이 허브(바텀네비 탭) + 내 정보 수정(풀스크린, 바텀네비 없음)
  MYPAGE: '/mypage',
  EDIT_PROFILE: '/mypage/edit',
} as const
