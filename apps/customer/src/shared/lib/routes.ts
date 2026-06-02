export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  WELCOME: '/welcome',

  // 카카오 소셜 로그인 — 콜백 처리(연동 시 카카오 redirect_uri) + 신규 추가정보 위저드 (둘 다 PublicOnly)
  KAKAO_CALLBACK: '/login/kakao/callback',
  SOCIAL_SIGNUP: '/signup/social',

  // 로그인 후 메인 탭 (TabLayout 의 자식 라우트)
  MAP: '/map',
  ALL: '/all',
  FAVS: '/favs',
  ORDERS: '/orders',
  MYPAGE: '/mypage',

  // 검색 — 키워드 검색·자동완성·최근 검색어 (TabLayout 밖 풀스크린 — 바텀네비 없음, 프로토타입 53-search)
  SEARCH: '/search',

  // 알림센터 — 홈 헤더 종에서 진입 (TabLayout 밖 풀스크린 — 바텀네비 없음, 프로토타입 51-notifications)
  NOTIFICATIONS: '/notifications',

  // 매장 상세 + 매장 위치 (TabLayout 밖 풀스크린 — 바텀네비 없음)
  STORE_DETAIL: (id: string) => `/store/${id}`,
  STORE_LOCATION: (id: string) => `/store/${id}/location`,
  /** 매장 상세 리뷰 탭으로 바로 진입 (상품 상세의 평점·리뷰 영역에서) */
  STORE_DETAIL_REVIEWS: (id: string) => `/store/${id}?tab=review`,

  // 상품 상세 (일반/떨이 한 화면, kind 로 분기 — TabLayout 밖 풀스크린)
  PRODUCT_DETAIL: (kind: 'deal' | 'menu', id: string) => `/product/${kind}/${id}`,

  // 장바구니 (TabLayout 밖 풀스크린 — 바텀네비 없음, 프로토타입 40-cart)
  CART: '/cart',

  // 결제 화면 + 주문 완료 (TabLayout 밖 풀스크린, 프로토타입 41-checkout · 42-order-success)
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order/success',

  // 주문 상세 (TabLayout 밖 풀스크린, 프로토타입 50-order-detail)
  ORDER_DETAIL: (id: string) => `/orders/${id}`,

  // 프로필(내 정보) 수정 — 마이페이지에서 진입, TabLayout 밖 풀스크린 (바텀네비 없음)
  EDIT_PROFILE: '/mypage/edit',

  // 알림 설정 — 마이페이지에서 진입, 풀스크린 (프로토타입 61-notif-settings)
  NOTIFICATION_SETTINGS: '/mypage/notifications',

  // 혜택 — 포인트 내역 / 쿠폰함 / 이벤트(쿠폰 받기). 마이페이지에서 진입, 풀스크린 (Phase 8)
  POINTS: '/mypage/points',
  COUPONS: '/mypage/coupons',
  EVENTS: '/mypage/events',

  // 리뷰 — 내가 쓴 리뷰 목록 + 작성/수정 (TabLayout 밖 풀스크린)
  MY_REVIEWS: '/reviews/my',
  /** 픽업 완료 주문에 리뷰 작성 (주문 탭에서 진입) */
  REVIEW_WRITE: (orderId: string) => `/reviews/write/${orderId}`,
  /** 본인 리뷰 수정 (내 리뷰 목록에서 진입) */
  REVIEW_EDIT: (reviewId: string) => `/reviews/${reviewId}/edit`,

  // 주소지 관리 (마이페이지/홈 헤더에서 진입 — 진입 링크 연결은 후속)
  ADDRESSES: '/addresses',
  ADDRESS_NEW: '/addresses/new',
  ADDRESS_EDIT: (id: string) => `/addresses/${id}/edit`,
} as const
