export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  // 비밀번호 재설정 — 이메일→휴대폰 본인인증→새 비번 (비로그인 전용, 프로토타입 11-forgot)
  PASSWORD_RESET: '/password-reset',

  // 주문(바텀네비 탭) + 주문 상세(풀스크린, 바텀네비 없음)
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ANALYTICS: '/analytics',

  STORE_MANAGE: '/store',
  STORE_HOURS: '/store/hours',
  STORE_EDIT: '/store/edit',
  STORE_NEW: '/store/new',

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

  // 정산 내역 (마이 허브에서 진입 — 이번 회차/회차별 내역·수수료 안내)
  SETTLEMENT: '/settlement',

  // 마이 허브(바텀네비 탭) + 내 정보 수정(풀스크린, 바텀네비 없음)
  MYPAGE: '/mypage',
  EDIT_PROFILE: '/mypage/edit',

  // 비밀번호 변경 — 로그인 상태(현재 비번 확인 후 변경). 마이/내 정보 수정에서 진입, 풀스크린 보호 라우트
  PASSWORD_CHANGE: '/mypage/password',

  // 공지사항 조회 + 고객센터(문의하기) — 마이 허브에서 진입, 풀스크린(바텀네비 없음, Phase 11)
  NOTICES: '/notices',
  SUPPORT: '/support',
  SUPPORT_INQUIRY_NEW: '/support/inquiry/new',
  SUPPORT_INQUIRY_DETAIL: (id: string) => `/support/inquiry/${id}`,

  // 알림센터(홈 히어로 종에서 진입) + 알림 설정(마이에서 진입) — 풀스크린, 바텀네비 없음 (프로토타입 51 / 52)
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_SETTINGS: '/mypage/notifications',
} as const
