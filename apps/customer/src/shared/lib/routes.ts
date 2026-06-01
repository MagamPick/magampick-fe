export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  WELCOME: '/welcome',

  // 로그인 후 메인 탭 (TabLayout 의 자식 라우트)
  MAP: '/map',
  ALL: '/all',
  FAVS: '/favs',
  ORDERS: '/orders',
  MYPAGE: '/mypage',

  // 매장 상세 + 매장 위치 (TabLayout 밖 풀스크린 — 바텀네비 없음)
  STORE_DETAIL: (id: string) => `/store/${id}`,
  STORE_LOCATION: (id: string) => `/store/${id}/location`,
  /** 매장 상세 리뷰 탭으로 바로 진입 (상품 상세의 평점·리뷰 영역에서) */
  STORE_DETAIL_REVIEWS: (id: string) => `/store/${id}?tab=review`,

  // 상품 상세 (일반/떨이 한 화면, kind 로 분기 — TabLayout 밖 풀스크린)
  PRODUCT_DETAIL: (kind: 'deal' | 'menu', id: string) => `/product/${kind}/${id}`,

  // 장바구니 (TabLayout 밖 풀스크린 — 바텀네비 없음, 프로토타입 40-cart)
  CART: '/cart',

  // 프로필(내 정보) 수정 — 마이페이지에서 진입, TabLayout 밖 풀스크린 (바텀네비 없음)
  EDIT_PROFILE: '/mypage/edit',

  // 주소지 관리 (마이페이지/홈 헤더에서 진입 — 진입 링크 연결은 후속)
  ADDRESSES: '/addresses',
  ADDRESS_NEW: '/addresses/new',
  ADDRESS_EDIT: (id: string) => `/addresses/${id}/edit`,
} as const
