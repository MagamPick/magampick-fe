/**
 * AUTO-GENERATED — 직접 수정 금지.
 * SpringDoc OpenAPI group: 1. Public (소비자)
 * 재생성: pnpm --filter @magampick/api-types gen
 */

export interface paths {
    "/api/v1/reviews/{reviewId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * 리뷰 수정
         * @description 본인 리뷰, 사장 답글 없는 경우만 수정 가능. 200 + 수정된 리뷰 반환.
         */
        put: operations["updateReview"];
        post?: never;
        /**
         * 리뷰 삭제 (soft)
         * @description 본인 리뷰, 사장 답글 없는 경우만 삭제 가능. 204.
         */
        delete: operations["deleteReview"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/push-tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * FCM 토큰 등록
         * @description 디바이스의 FCM 토큰을 등록(upsert). 로그인 후 호출. 같은 토큰 재등록 시 소유자 재할당.
         */
        post: operations["register"];
        /**
         * FCM 토큰 해제
         * @description 디바이스의 FCM 토큰을 해제. 로그아웃 시 호출. 미등록 토큰이어도 204.
         */
        delete: operations["unregister"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/payments/toss/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 토스 결제 확인
         * @description 토스 SDK 결제 후 paymentKey·orderId·amount 를 서버로 전달해 최종 승인한다. 주문이 PENDING 으로 활성화된다. ROLE_CUSTOMER 인증 필요.
         */
        post: operations["confirmTossPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 내 주문 목록
         * @description 소비자 본인의 주문 목록. segment=ALL(기본) / PICKUP_WAITING / DONE. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["listMyOrders"];
        put?: never;
        /**
         * 주문 준비
         * @description 주문을 AWAITING_PAYMENT 상태로 임시 생성한다. 반환된 tossOrderId·amount·orderName 을 토스 SDK에 전달 후 POST /api/v1/payments/toss/confirm 으로 결제를 확인한다. ROLE_CUSTOMER 인증 필요.
         */
        post: operations["createOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{orderId}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 리뷰 작성
         * @description 픽업 완료(COMPLETED) 주문에만 작성 가능. 201 + 생성된 리뷰 반환.
         */
        post: operations["createReview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{orderId}/refund": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 환불 요청
         * @description 수령완료 주문에 대해 환불을 요청한다. COMPLETED 주문 / completedAt 후 3일 이내 / 1주문 1요청. ROLE_CUSTOMER 인증 필요.
         */
        post: operations["requestRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 주문 취소
         * @description 소비자 본인 주문 취소. PENDING 상태만 가능. 자동 환불 stub. ROLE_CUSTOMER 인증 필요.
         */
        post: operations["cancelOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/dev/push/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [임시] 내 토큰으로 발송
         * @description 인증 사용자의 저장된 모든 토큰으로 발송. 저장+조회+발송 경로 검증용.
         */
        post: operations["me"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/dev/push/echo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * [임시] 토큰 직접 발송
         * @description body 의 token 으로 FCM 1건 발송. 저장 없이 Firebase 배선 검증용.
         */
        post: operations["echo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/phone": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 소비자 본인 휴대폰 변경
         * @description 본인인증 stub 을 통과한 새 휴대폰 번호로 갱신한다. phone_verified_at 도 함께 갱신.
         */
        post: operations["updatePhone"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/inquiries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 소비자 내 문의 목록
         * @description 본인 문의 목록 최신순.
         */
        get: operations["list"];
        put?: never;
        /**
         * 소비자 문의 생성
         * @description 소비자 1:1 문의 접수. 생성 시 상태는 PENDING.
         */
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/favorites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 단골 매장 목록 조회 */
        get: operations["list_1"];
        put?: never;
        /** 즐겨찾기 등록 */
        post: operations["add"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/coupons/events/{couponId}/claim": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 이벤트 쿠폰 발급 (선착순) */
        post: operations["claim"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/addresses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 주소지 목록 조회
         * @description 본인이 등록한 주소지 0~3개를 조회한다. 기본 주소지가 가장 위에 온다.
         */
        get: operations["list_2"];
        put?: never;
        /**
         * 주소지 등록
         * @description 다음 우편번호 위젯 결과로 본인 주소지를 등록한다. 최대 3개까지 보유 가능. 첫 등록 시 자동으로 기본 주소지로 지정된다.
         */
        post: operations["create_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/addresses/{addressId}/default": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 기본 주소지 변경
         * @description 지정한 주소를 기본 주소지로 설정한다. 기존 기본 주소지는 자동으로 해제된다. 이미 기본 주소지인 경우 멱등하게 처리된다.
         */
        post: operations["markAsDefault"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/addresses/reverse-geocode": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 현재 위치 역지오코딩
         * @description GPS 좌표에서 가장 가까운 도로명 주소 라벨을 조회한다.
         */
        post: operations["reverseGeocode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 소비자 회원가입
         * @description 소비자 계정을 생성하고 자동 로그인한다. refresh 는 HttpOnly 쿠키로 발급.
         */
        post: operations["signupCustomer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/signup/social": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 카카오 신규 회원 추가정보 가입
         * @description 소셜 토큰 + 약관·본인인증·주소·닉네임으로 가입하고 자동 로그인한다. refresh 는 HttpOnly 쿠키.
         */
        post: operations["signupSocial"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/seller/stores/business-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 사장 가입용 사업자 진위확인
         * @description 사장 회원가입 첫 매장 등록 단계에서 사업자 번호·대표자명·개업일자의 일치 여부를 확인한다.
         */
        post: operations["verifyBusiness"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/seller/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 사장 회원가입
         * @description 사장 계정과 첫 매장을 한 트랜잭션으로 생성하고 자동 로그인한다. refresh 는 HttpOnly 쿠키로 발급.
         */
        post: operations["signupSeller"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/seller/password-resets/verify-identity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 사장 비밀번호 재설정 본인확인
         * @description 이메일과 휴대폰 본인인증 토큰으로 재설정 토큰을 발급한다.
         */
        post: operations["verifySellerPasswordResetIdentity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/seller/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 사장 로그인
         * @description 이메일/비밀번호 로그인. access 는 바디, refresh 는 HttpOnly 쿠키.
         */
        post: operations["loginSeller"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 토큰 갱신
         * @description refresh 쿠키로 새 access 토큰을 재발급한다 (rotation 없음).
         */
        post: operations["refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/phone-verifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 인증번호 발송
         * @description 휴대폰 번호로 6자리 SMS 인증번호를 발송한다. 회원가입·비밀번호 재설정에서 호출된다.
         */
        post: operations["request"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/phone-verifications/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 인증번호 검증
         * @description 인증번호를 검증하고 성공 시 본인인증 토큰(15분)을 발급한다.
         */
        post: operations["confirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-resets/verify-identity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 소비자 비밀번호 재설정 본인확인
         * @description 이메일과 휴대폰 본인인증 토큰으로 재설정 토큰을 발급한다.
         */
        post: operations["verifyCustomerPasswordResetIdentity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-resets/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 비밀번호 재설정 완료
         * @description 재설정 토큰으로 새 비밀번호를 저장하고 모든 refresh 세션을 폐기한다.
         */
        post: operations["resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 로그아웃
         * @description refresh 세션을 무효화하고 쿠키를 만료시킨다.
         */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 소비자 로그인
         * @description 이메일/비밀번호 로그인. access 는 바디, refresh 는 HttpOnly 쿠키.
         */
        post: operations["loginCustomer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/kakao": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 카카오 로그인
         * @description 카카오 인가코드로 기존/신규 분기. 기존=즉시 로그인(refresh 쿠키), 신규=소셜 토큰 반환(추가정보 가입 필요).
         */
        post: operations["kakaoLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/admin/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 관리자 로그인
         * @description 사용자명/비밀번호 로그인. access 는 바디, refresh 는 HttpOnly 쿠키.
         */
        post: operations["loginAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 소비자 본인 프로필 조회
         * @description JWT 의 customerId 에 해당하는 소비자의 프로필을 반환한다.
         */
        get: operations["getProfile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * 소비자 본인 닉네임 수정
         * @description JWT 의 customerId 에 해당하는 소비자의 nickname 을 갱신한다.
         */
        patch: operations["updateProfile"];
        trace?: never;
    };
    "/api/v1/customers/me/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** 소비자 알림 단건 읽음 처리 */
        patch: operations["markRead"];
        trace?: never;
    };
    "/api/v1/customers/me/notifications/read-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** 소비자 알림 전체 읽음 처리 */
        patch: operations["markAllRead"];
        trace?: never;
    };
    "/api/v1/customers/me/notification-settings/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * 소비자 알림 설정 개별 변경
         * @description key: nearbyDeal, favoriteStore, orderRefund, reviewReply, eventBenefit, marketing
         */
        patch: operations["updateSetting"];
        trace?: never;
    };
    "/api/v1/customers/me/addresses/{addressId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * 주소지 삭제
         * @description 본인 주소지를 삭제한다. 기본 주소지와 마지막 주소지는 삭제할 수 없다.
         */
        delete: operations["delete"];
        options?: never;
        head?: never;
        /**
         * 주소지 수정
         * @description 본인 주소지의 라벨/주소를 부분 수정한다. 주소 변경 시 다음 우편번호 위젯 결과를 함께 보낸다.
         */
        patch: operations["update"];
        trace?: never;
    };
    "/api/v1/auth/me/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * 비밀번호 변경
         * @description 현재 비밀번호 확인 후 새 비밀번호를 저장하고 현재 기기 외 refresh 세션을 폐기한다.
         */
        patch: operations["changePassword"];
        trace?: never;
    };
    "/api/v1/terms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 약관 목록 조회
         * @description 회원가입 화면에 표시할 약관 목록(필수 + 선택)을 조회한다.
         */
        get: operations["getTerms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/stores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 전체 매장 조회
         * @description 소비자 기본 주소지 5km 이내 OPEN 매장 목록. 5종 정렬(recommended/distance/discount/closing/rating). ROLE_CUSTOMER 인증 필요.
         */
        get: operations["list_3"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/stores/{storeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 매장 상세 조회
         * @description 매장 헤더/정보탭 데이터. 영업상태 무관 조회. 기본 주소지 기반 거리·isFavorite. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["detail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/stores/{storeId}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 매장 리뷰 목록 조회
         * @description 최신순 SliceResponse. 삭제된 리뷰 제외.
         */
        get: operations["getReviews"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/stores/{storeId}/reviews/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 매장 리뷰 요약 조회
         * @description 평균 별점 + 1~5점 분포 (5점 → 1점 순, 없는 별점은 count=0).
         */
        get: operations["getReviewSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/stores/{storeId}/menu": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 메뉴 탭 조회
         * @description 매장의 ON_SALE 상품 목록 (flat). 인증 불요(public).
         */
        get: operations["menu"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/stores/{storeId}/clearance-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 마감할인 탭 조회
         * @description 매장의 활성(OPEN) 마감할인 목록. 인증 불요(public).
         */
        get: operations["deals"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/stores/neighborhood": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 우리 동네 마감픽 조회
         * @description 기본 주소지 5km · OPEN · 오늘영업 매장 중 단골 제외, 추천 스코어 정렬 최대 6개 반환. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["neighborhood"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/stores/map": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 지도 기반 매장 조회
         * @description 카카오맵 중심 GPS 좌표 기준 반경 내 OPEN·오늘영업 매장 마커 목록. radiusKm: 1/3/5 만 허용. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["map"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 키워드 검색
         * @description 기본 주소지 5km 이내 OPEN 매장 세트에서 매장명·떨이명·상품명 부분 일치 검색. 빈 q → 빈 결과. 5종 정렬 지원. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search/autocomplete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 검색어 자동완성
         * @description 기본 주소지 5km 이내 매장 세트에서 word_similarity 기반 이름 제안. 1자 미만 → 빈 결과. 최대 10개, 유사도 내림차순. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["autocomplete"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/products/{productId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 일반 상품 상세 조회
         * @description 일반 상품 단건 상세 정보. 매장 미리보기(거리·영업상태·closingTime) 포함. 평점/리뷰 수는 0(일반 상품은 주문 대상 아님). ROLE_CUSTOMER 인증 필요.
         */
        get: operations["detail_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{orderId}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 주문별 리뷰 조회
         * @description 리뷰 없으면 204 No Content.
         */
        get: operations["getOrderReview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 내 주문 상세
         * @description 소비자 본인 주문 단건 조회. 타인 주문 접근 시 403. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["getMyOrder"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/orders/reviewable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 리뷰 작성 가능한 완료 주문 목록
         * @description COMPLETED 주문 목록. reviewed/reviewId 포함.
         */
        get: operations["getReviewableOrders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/faqs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 소비자 FAQ 목록
         * @description 소비자 대상 FAQ 목록. sortOrder 오름차순.
         */
        get: operations["list_4"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 소비자 마이페이지 통계 조회
         * @description 이번 달 절약 금액(마감할인 합), 구한 음식 수(누적), 단골 가게 수를 반환한다. 데이터 없으면 0.
         */
        get: operations["getStats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 소비자 본인 리뷰 목록
         * @description 최신순, 삭제 제외.
         */
        get: operations["getMyReviews"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/points/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 포인트 잔액 조회 */
        get: operations["getSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/points/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 포인트 내역 조회 */
        get: operations["getHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 소비자 알림 목록 조회
         * @description segment: all(기본)/deal/order. null 또는 빈 값이면 전체 조회.
         */
        get: operations["list_5"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/notifications/unread-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 소비자 미읽음 알림 수 조회 */
        get: operations["unreadCount"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/notification-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 소비자 알림 설정 조회 */
        get: operations["getSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/inquiries/{inquiryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 소비자 내 문의 상세
         * @description 본인 문의 단건 조회. 타인 것이거나 없으면 404.
         */
        get: operations["get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/coupons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 쿠폰함 조회 */
        get: operations["getMyCoupons"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/coupons/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 이벤트 쿠폰 목록 조회 */
        get: operations["getEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clearance-items/{clearanceItemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 떨이 상품 상세 조회
         * @description 떨이 상품 단건 상세 정보. 매장 미리보기(거리·영업상태·closingTime) + 평점 + dealStatus 포함. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["detail_2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/clearance-items/closing-soon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 마감 임박 특가 조회
         * @description 기본 주소지 5km · OPEN · 오늘영업 매장의 60분 이내 활성 떨이를 마감 가까운 순 최대 5개 반환. ROLE_CUSTOMER 인증 필요.
         */
        get: operations["closingSoon"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/email-availability": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 이메일 사용 가능 여부 조회
         * @description 역할별 회원가입 이메일 중복 여부를 확인한다.
         */
        get: operations["checkEmailAvailability"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/announcements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 공지사항 목록 조회
         * @description 핀 우선 → 발행일 최신 → id 내림차순 정렬. 인증 필요.
         */
        get: operations["list_6"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/me/favorites/{storeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 즐겨찾기 해제 */
        delete: operations["remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        UpdateReviewRequest: {
            /** Format: int32 */
            rating: number;
            content?: string;
            tags?: ("DELICIOUS" | "FRESH" | "REORDER" | "FAST_PICKUP" | "GENEROUS" | "GOOD_VALUE" | "KIND")[];
            photos?: string[];
        };
        /** @description 소비자 본인 리뷰 아이템 */
        MyReviewResponse: {
            /**
             * Format: int64
             * @description 리뷰 ID
             */
            id?: number;
            /**
             * Format: int64
             * @description 매장 ID
             */
            storeId?: number;
            /** @description 매장명 */
            storeName?: string;
            /** @description 주문한 상품 목록 */
            items?: components["schemas"]["ReviewedProduct"][];
            /**
             * Format: int32
             * @description 별점 (1-5)
             */
            rating?: number;
            /** @description 리뷰 내용 */
            content?: string;
            /** @description 리뷰 태그 한국어 라벨 목록 */
            tags?: string[];
            /** @description 리뷰 사진 URL 목록 */
            photos?: string[];
            /**
             * Format: date-time
             * @description 작성 시각
             */
            createdAt?: string;
            /** @description 사장 답글 (없으면 null) */
            ownerReply?: string;
        };
        /** @description 리뷰에 포함된 주문 상품 */
        ReviewedProduct: {
            /**
             * Format: int64
             * @description 상품 ID
             */
            productId?: number;
            /** @description 상품 종류 (deal / menu) */
            kind?: string;
            /** @description 상품명 */
            name?: string;
        };
        /** @description FCM 토큰 등록 요청 */
        PushTokenRegisterRequest: {
            /** @description FCM 디바이스 토큰 */
            token?: string;
        };
        /** @description FCM 토큰 등록 응답 */
        PushTokenResponse: {
            /**
             * Format: int64
             * @description 등록된 토큰 ID
             * @example 100
             */
            id?: number;
        };
        /** @description 토스 결제 확인 요청 */
        TossConfirmRequest: {
            /**
             * @description 토스 발급 결제 키
             * @example tgen_20240101abc
             */
            paymentKey?: string;
            /**
             * Format: int64
             * @description 주문 DB ID (PrepareOrderResponse.orderId)
             * @example 42
             */
            orderId: number;
            /**
             * @description 결제 금액 (PrepareOrderResponse.amount 와 일치)
             * @example 6000
             */
            amount: number;
        };
        /** @description 금액 요약 */
        OrderAmountsResponse: {
            /**
             * @description 정상가 합계
             * @example 9000
             */
            normalTotal?: number;
            /**
             * @description 할인 합계
             * @example 3000
             */
            discountTotal?: number;
            /**
             * @description 결제액
             * @example 6000
             */
            payTotal?: number;
        };
        /** @description 주문 항목 */
        OrderItemResponse: {
            /**
             * Format: int64
             * @description 항목 ID
             */
            id?: number;
            /**
             * @description 상품 종류 (DEAL/MENU)
             * @example DEAL
             */
            kind?: string;
            /**
             * @description 상품명
             * @example 크로아상
             */
            name?: string;
            /** @description 이미지 URL (nullable) */
            imageUrl?: string;
            /**
             * @description 정상가
             * @example 4500
             */
            originalPrice?: number;
            /**
             * @description 결제 단가 (DEAL=할인가, MENU=정상가)
             * @example 3000
             */
            salePrice?: number;
            /**
             * Format: int32
             * @description 수량
             * @example 2
             */
            qty?: number;
        };
        /** @description 주문 응답 */
        OrderResponse: {
            /**
             * Format: int64
             * @description 주문 ID
             * @example 42
             */
            id?: number;
            /**
             * @description 표시용 주문 번호 (id 기반 파생)
             * @example 0042
             */
            orderNo?: string;
            /**
             * Format: int64
             * @description 매장 ID
             * @example 1
             */
            storeId?: number;
            /**
             * @description 매장명
             * @example 동네빵집
             */
            storeName?: string;
            /**
             * @description 매장 전화번호 (nullable)
             * @example 0212345678
             */
            storePhone?: string;
            /** @description 주문 항목 목록 */
            items?: components["schemas"]["OrderItemResponse"][];
            /** @description 픽업 정보 */
            pickup?: components["schemas"]["PickupResponse"];
            /** @description 픽업 요청 메모 */
            memo?: string;
            /** @description 금액 요약 */
            amounts?: components["schemas"]["OrderAmountsResponse"];
            /**
             * @description 픽업 인증 코드 4자리
             * @example 3827
             */
            pickupCode?: string;
            /**
             * @description 주문 상태
             * @example PENDING
             */
            status?: string;
            /**
             * @description 결제 수단
             * @example toss
             */
            paymentMethod?: string;
            /**
             * Format: date-time
             * @description 생성 시각 (KST ISO 8601)
             */
            createdAt?: string;
            /**
             * Format: date-time
             * @description 수령완료 시각 (KST ISO 8601, nullable)
             */
            completedAt?: string;
            /**
             * Format: date-time
             * @description 취소 시각 (KST ISO 8601, nullable)
             */
            cancelledAt?: string;
            /** @description 환불 정보 (환불 미요청 시 null) */
            refund?: components["schemas"]["RefundInfoResponse"];
        };
        /** @description 픽업 정보 */
        PickupResponse: {
            /**
             * @description 픽업 유형 (ASAP/SLOT)
             * @example ASAP
             */
            type?: string;
            /**
             * @description 픽업 시각 HH:mm (SLOT 시)
             * @example 18:30
             */
            time?: string;
        };
        /** @description 환불 요약 정보 (환불 미요청 시 null) */
        RefundInfoResponse: {
            /**
             * @description 환불 상태
             * @example REQUESTED
             */
            status?: string;
            /**
             * @description 환불 사유
             * @example 상품이 예상과 달랐어요
             */
            reason?: string;
            /**
             * Format: date-time
             * @description 환불 요청 시각 (KST ISO 8601)
             */
            requestedAt?: string;
            /** @description 거부 사유 (nullable) */
            rejectReason?: string;
            /**
             * Format: date-time
             * @description 처리 시각 (KST ISO 8601, nullable)
             */
            resolvedAt?: string;
        };
        /** @description 금액 교차검증 요청 (선택) */
        AmountsRequest: {
            /**
             * @description 정상가 합계
             * @example 9000
             */
            normalTotal: number;
            /**
             * @description 할인 합계 (떨이 할인분)
             * @example 3000
             */
            discountTotal: number;
            /**
             * @description 결제액 = normalTotal - discountTotal
             * @example 6000
             */
            payTotal: number;
            /**
             * @description 쿠폰 할인 금액 (선택)
             * @example 2000
             */
            couponDiscount?: number;
            /**
             * Format: int64
             * @description 포인트 사용 금액 (선택)
             * @example 500
             */
            pointUsed?: number;
            /**
             * @description 실결제액 = payTotal - couponDiscount - pointUsed (선택)
             * @example 3500
             */
            finalAmount?: number;
            /**
             * Format: int64
             * @description 주문 완료 시 적립 예정 포인트 (선택)
             * @example 35
             */
            earnedPoints?: number;
        };
        /** @description 주문 생성 요청 */
        CreateOrderRequest: {
            /**
             * Format: int64
             * @description 매장 ID
             * @example 1
             */
            storeId: number;
            /** @description 주문 항목 목록 (최소 1개) */
            items?: components["schemas"]["OrderItemRequest"][];
            /** @description 픽업 정보 */
            pickup: components["schemas"]["PickupRequest"];
            /**
             * @description 픽업 요청 메모 (≤80자, 선택)
             * @example 빵 나오는 즉시 픽업 예정입니다
             */
            memo?: string;
            /**
             * @description 결제 수단 (toss 고정)
             * @example toss
             */
            paymentMethod?: string;
            /**
             * @description 결제 동의 여부 (true 필수)
             * @example true
             */
            paymentAgreed: boolean;
            /** @description 금액 교차검증 (선택 — 불일치 시 AMOUNT_MISMATCH) */
            amounts?: components["schemas"]["AmountsRequest"];
            /**
             * Format: int64
             * @description 사용할 쿠폰 UserCoupon ID (선택)
             * @example 5
             */
            userCouponId?: number;
            /**
             * Format: int32
             * @description 사용할 포인트 (선택, 0 이상)
             * @example 1000
             */
            pointToUse?: number;
        };
        /** @description 주문 항목 */
        OrderItemRequest: {
            /**
             * @description 상품 종류 (DEAL=떨이, MENU=일반)
             * @example DEAL
             * @enum {string}
             */
            kind: "DEAL" | "MENU";
            /**
             * Format: int64
             * @description 상품 ID (DEAL=clearanceItemId, MENU=productId)
             * @example 10
             */
            refId: number;
            /**
             * Format: int32
             * @description 수량 (1~10)
             * @example 2
             */
            quantity?: number;
        };
        /** @description 픽업 요청 */
        PickupRequest: {
            /**
             * @description 픽업 유형 (ASAP=즉시, SLOT=시간 지정)
             * @example ASAP
             * @enum {string}
             */
            type: "ASAP" | "SLOT";
            /**
             * @description 픽업 시각 (SLOT 시 HH:mm, 15분 단위, 영업종료 전)
             * @example 18:30
             */
            time?: string;
        };
        /** @description 주문 준비 응답 (토스 결제 전) */
        PrepareOrderResponse: {
            /**
             * Format: int64
             * @description 주문 DB ID (confirm 엔드포인트에 사용)
             * @example 42
             */
            orderId?: number;
            /**
             * @description 토스 SDK에 전달할 주문 ID (6자 이상, 'order-{orderId}' 형식)
             * @example order-42
             */
            tossOrderId?: string;
            /**
             * @description 결제 금액
             * @example 6000
             */
            amount?: number;
            /**
             * @description 주문명 (토스 SDK 표시용)
             * @example 크로아상 외 1건
             */
            orderName?: string;
        };
        CreateReviewRequest: {
            /** Format: int32 */
            rating: number;
            content?: string;
            tags?: ("DELICIOUS" | "FRESH" | "REORDER" | "FAST_PICKUP" | "GENEROUS" | "GOOD_VALUE" | "KIND")[];
            photos?: string[];
        };
        /** @description 환불 요청 */
        RefundRequestRequest: {
            /**
             * @description 환불 사유 (1~200자)
             * @example 상품이 예상과 달랐어요
             */
            reason?: string;
        };
        /** @description [임시] 내 토큰으로 발송 요청 */
        DevPushMeRequest: {
            /**
             * @description 알림 제목
             * @example 테스트 알림
             */
            title?: string;
            /**
             * @description 알림 본문
             * @example 내 토큰 발송 확인
             */
            body?: string;
        };
        /** @description [임시] 내 토큰 발송 응답 */
        DevPushMeResponse: {
            /**
             * Format: int32
             * @description 발송 성공한 토큰 수
             * @example 2
             */
            sentCount?: number;
        };
        /** @description [임시] FCM 토큰 직접 발송 요청 */
        DevPushEchoRequest: {
            /** @description FCM 디바이스 토큰 */
            token?: string;
            /**
             * @description 알림 제목
             * @example 테스트 알림
             */
            title?: string;
            /**
             * @description 알림 본문
             * @example FCM 배선 확인
             */
            body?: string;
        };
        /** @description [임시] FCM 발송 응답 */
        DevPushResponse: {
            /**
             * @description FCM 메시지 ID (mock 모드면 MOCK)
             * @example projects/x/messages/1
             */
            messageId?: string;
        };
        CustomerPhoneUpdateRequest: {
            /**
             * @description 휴대폰 번호 (010 prefix, 숫자 11자리)
             * @example 01012345678
             */
            phone?: string;
            /**
             * @description 본인인증 토큰 (POST /api/v1/auth/phone-verifications/confirm 에서 발급)
             * @example 550e8400-e29b-41d4-a716-446655440000
             */
            verificationToken?: string;
        };
        /** @description 소비자 프로필 응답 */
        CustomerProfileResponse: {
            /**
             * Format: int64
             * @description 소비자 식별자
             * @example 1
             */
            id?: number;
            /**
             * @description 로그인 이메일
             * @example customer@example.com
             */
            email?: string;
            /**
             * @description 닉네임
             * @example 마감픽유저
             */
            nickname?: string;
            /**
             * @description 휴대폰 번호
             * @example 01012345678
             */
            phone?: string;
            /**
             * Format: date-time
             * @description 휴대폰 인증/변경 시각
             */
            phoneVerifiedAt?: string;
            /**
             * Format: date-time
             * @description 가입 시각
             */
            createdAt?: string;
        };
        /** @description 문의 생성 요청 */
        InquiryCreateRequest: {
            /**
             * @description 카테고리 (payment / order / coupon / account / report / settlement / store / product / etc)
             * @enum {string}
             */
            category: "payment" | "order" | "coupon" | "account" | "report" | "settlement" | "store" | "product" | "etc";
            /** @description 제목 (2~40자) */
            title?: string;
            /** @description 내용 (10~1000자) */
            content?: string;
        };
        /** @description 문의 답변 */
        InquiryAnswerResponse: {
            /** @description 답변 내용 */
            content?: string;
            /**
             * Format: date
             * @description 답변일 (yyyy-MM-dd)
             */
            answeredAt?: string;
        };
        /** @description 문의 응답 */
        InquiryResponse: {
            /**
             * Format: int64
             * @description 문의 ID
             */
            id?: number;
            /**
             * @description 카테고리
             * @enum {string}
             */
            category?: "payment" | "order" | "coupon" | "account" | "report" | "settlement" | "store" | "product" | "etc";
            /** @description 제목 */
            title?: string;
            /** @description 내용 */
            content?: string;
            /**
             * @description 상태 (pending / answered)
             * @enum {string}
             */
            status?: "pending" | "answered";
            /**
             * Format: date
             * @description 접수일 (yyyy-MM-dd)
             */
            createdAt?: string;
            /** @description 답변 (없으면 null) */
            answer?: components["schemas"]["InquiryAnswerResponse"];
        };
        /** @description 즐겨찾기 등록 요청 */
        FavoriteAddRequest: {
            /**
             * Format: int64
             * @description 매장 ID
             * @example 1
             */
            storeId: number;
        };
        /** @description 즐겨찾기 등록 응답 */
        FavoriteAddResponse: {
            /**
             * Format: int64
             * @description 즐겨찾기한 매장 ID
             * @example 1
             */
            storeId?: number;
            /**
             * Format: date-time
             * @description 즐겨찾기 등록 시각
             */
            createdAt?: string;
        };
        CouponResponse: {
            /**
             * Format: int64
             * @description 발급 인스턴스 ID
             */
            id?: number;
            /**
             * @description 쿠폰 상태
             * @enum {string}
             */
            status?: "USABLE" | "USED" | "EXPIRED";
            /**
             * @description 할인 방식
             * @enum {string}
             */
            discountType?: "RATE" | "AMOUNT";
            /**
             * Format: int32
             * @description 할인 값 (RATE=%, AMOUNT=원)
             */
            value?: number;
            /**
             * Format: int32
             * @description 최소 주문 금액
             */
            minOrder?: number;
            /** @description 쿠폰 이름 */
            label?: string;
            /**
             * Format: date
             * @description 유효기간 만료일
             */
            expiresAt?: string;
        };
        /** @description 주소지 등록 요청 */
        AddressCreateRequest: {
            /**
             * @description 사용자 지정 라벨
             * @example 집
             */
            label?: string;
            /**
             * @description 도로명 주소
             * @example 서울특별시 강남구 테헤란로 427
             */
            roadAddress?: string;
            /**
             * @description 지번 주소 (선택)
             * @example 서울특별시 강남구 삼성동 159
             */
            jibunAddress?: string;
            /**
             * @description 상세 주소 (사용자 직접 입력)
             * @example 101동 1502호
             */
            detailAddress?: string;
            /**
             * @description 우편번호 5자리
             * @example 06158
             */
            zonecode?: string;
            /**
             * @description 시군구코드 (다음 위젯 sigunguCode, 5자리)
             * @example 11680
             */
            sigunguCode?: string;
            /**
             * @description 도로명번호 (다음 위젯 roadnameCode, 최대 7자리)
             * @example 3179999
             */
            roadnameCode?: string;
        };
        /** @description 주소지 응답 */
        AddressResponse: {
            /**
             * Format: int64
             * @description 주소지 식별자
             * @example 1
             */
            id?: number;
            /**
             * @description 사용자 지정 라벨
             * @example 집
             */
            label?: string;
            /**
             * @description 도로명 주소
             * @example 서울특별시 강남구 테헤란로 427
             */
            roadAddress?: string;
            /**
             * @description 지번 주소
             * @example 서울특별시 강남구 삼성동 159
             */
            jibunAddress?: string;
            /**
             * @description 상세 주소
             * @example 101동 1502호
             */
            detailAddress?: string;
            /**
             * @description 우편번호 5자리
             * @example 06158
             */
            zonecode?: string;
            /**
             * Format: double
             * @description 위도
             * @example 37.5066
             */
            latitude?: number;
            /**
             * Format: double
             * @description 경도
             * @example 127.0535
             */
            longitude?: number;
            /**
             * @description 기본 주소지 여부
             * @example true
             */
            isDefault?: boolean;
            /**
             * Format: date-time
             * @description 생성 시각 (KST)
             */
            createdAt?: string;
            /**
             * Format: date-time
             * @description 수정 시각 (KST)
             */
            updatedAt?: string;
        };
        /** @description 현재 위치 역지오코딩 요청 */
        AddressReverseGeocodeRequest: {
            /**
             * Format: double
             * @description 위도
             * @example 37.5665
             */
            latitude: number;
            /**
             * Format: double
             * @description 경도
             * @example 126.978
             */
            longitude: number;
        };
        /** @description 현재 위치 역지오코딩 응답 */
        AddressReverseGeocodeResponse: {
            /**
             * @description 가장 가까운 도로명 주소
             * @example 서울특별시 중구 세종대로 110
             */
            roadAddress?: string;
        };
        /** @description 소비자 회원가입 요청 (약관·본인인증·주소·닉네임 통합) */
        CustomerSignupRequest: {
            /**
             * @description 이메일
             * @example customer@magampick.com
             */
            email?: string;
            /**
             * @description 비밀번호 (8자 이상, 영문·숫자·특수문자 포함)
             * @example Abcd1234!
             */
            password?: string;
            /**
             * @description 닉네임 (2~12자)
             * @example 마감픽유저
             */
            nickname?: string;
            /**
             * @description 휴대폰 번호
             * @example 010-1234-5678
             */
            phone?: string;
            /**
             * @description 본인인증 토큰 (본인인증 검증 응답의 verificationToken)
             * @example a1b2c3d4-...
             */
            verificationToken?: string;
            /**
             * @description 동의한 약관 ID 목록 (필수 약관 모두 포함)
             * @example [
             *       1,
             *       2,
             *       3,
             *       4
             *     ]
             */
            agreedTermIds?: number[];
            /** @description 기본 주소 (좌표 포함) */
            address?: components["schemas"]["AddressCreateRequest"];
        };
        /** @description 토큰 발급 응답 (refresh 는 HttpOnly 쿠키로 전달되어 바디에 없음) */
        TokenResponse: {
            /**
             * @description Access Token
             * @example eyJhbGciOiJIUzI1NiJ9...
             */
            accessToken?: string;
            /**
             * Format: int64
             * @description Access Token 만료까지 남은 초
             * @example 1800
             */
            accessExpiresIn?: number;
        };
        /** @description 카카오 신규 회원 추가정보 가입 요청 (소셜 토큰 + 약관·본인인증·주소·닉네임) */
        SocialSignupRequest: {
            /** @description 1단계 /kakao 응답의 소셜 토큰 */
            socialToken?: string;
            /**
             * @description 닉네임 (2~12자, 카카오 prefill 수정 가능)
             * @example 마감픽유저
             */
            nickname?: string;
            /**
             * @description 휴대폰 번호
             * @example 010-1234-5678
             */
            phone?: string;
            /**
             * @description 본인인증 토큰 (본인인증 검증 응답의 verificationToken)
             * @example a1b2c3d4-...
             */
            verificationToken?: string;
            /**
             * @description 동의한 약관 ID 목록 (필수 약관 모두 포함)
             * @example [
             *       1,
             *       2,
             *       3,
             *       4
             *     ]
             */
            agreedTermIds?: number[];
            /** @description 기본 주소 (좌표 포함) */
            address?: components["schemas"]["AddressCreateRequest"];
        };
        /** @description 사업자 검증 요청 (등록 폼 [조회하기] 버튼) */
        BusinessVerificationRequest: {
            /**
             * @description 사업자 번호 (숫자 10자리, 하이픈 허용)
             * @example 123-45-67890
             */
            businessNumber?: string;
            /**
             * @description 대표자 실명 (사업자등록증 기재)
             * @example 홍길동
             */
            representativeName?: string;
            /**
             * Format: date
             * @description 개업일자 (사업자등록증 기재, ISO yyyy-MM-dd)
             * @example 2024-03-15
             */
            openDate: string;
        };
        /** @description 사장 회원가입 요청 */
        SellerSignupRequest: {
            /**
             * @description 이메일
             * @example seller@magampick.com
             */
            email?: string;
            /**
             * @description 비밀번호
             * @example Abcd1234!
             */
            password?: string;
            /**
             * @description 사장 실명
             * @example 홍길동
             */
            ownerName?: string;
            /**
             * @description 휴대폰 번호
             * @example 010-1234-5678
             */
            phone?: string;
            /**
             * @description 본인인증 토큰
             * @example phone-verification-token
             */
            verificationToken?: string;
            /**
             * @description 동의한 약관 ID 목록
             * @example [
             *       1,
             *       2,
             *       3,
             *       6
             *     ]
             */
            agreedTermIds?: number[];
            /** @description 첫 매장 등록 요청 */
            store: components["schemas"]["StoreCreateRequest"];
        };
        /** @description 매장 등록 신청 요청 — 사업자 검증 정보 + 매장 정보 */
        StoreCreateRequest: {
            /**
             * @description 사업자 번호 (숫자 10자리, 하이픈 허용)
             * @example 123-45-67890
             */
            businessNumber?: string;
            /**
             * @description 대표자 실명 (사업자등록증 기재)
             * @example 홍길동
             */
            representativeName?: string;
            /**
             * Format: date
             * @description 개업일자 (사업자등록증 기재, ISO yyyy-MM-dd)
             * @example 2024-03-15
             */
            openDate: string;
            /**
             * @description 매장명
             * @example 동네빵집
             */
            name?: string;
            /**
             * @description 도로명 주소
             * @example 서울특별시 강남구 테헤란로 427
             */
            roadAddress?: string;
            /**
             * @description 지번 주소 (선택)
             * @example 서울특별시 강남구 삼성동 159-1
             */
            jibunAddress?: string;
            /**
             * @description 상세 주소 (선택)
             * @example 1층
             */
            detailAddress?: string;
            /**
             * @description 우편번호
             * @example 06158
             */
            zonecode?: string;
            /**
             * @description 매장 전화번호
             * @example 0212345678
             */
            phone?: string;
            /**
             * @description 매장 소개 (선택)
             * @example 매일 아침 직접 굽는 신선한 빵
             */
            description?: string;
            /**
             * @description 시군구코드 (다음 위젯 sigunguCode, 5자리)
             * @example 11680
             */
            sigunguCode?: string;
            /**
             * @description 도로명번호 (다음 위젯 roadnameCode, 최대 7자리)
             * @example 3179999
             */
            roadnameCode?: string;
        };
        /** @description 비밀번호 재설정 본인확인 요청 */
        PasswordResetVerifyRequest: {
            /**
             * @description 가입 이메일
             * @example customer@magampick.com
             */
            email?: string;
            /**
             * @description 휴대폰 번호
             * @example 010-1234-5678
             */
            phone?: string;
            /**
             * @description 휴대폰 본인인증 검증 응답의 verificationToken
             * @example a1b2c3d4-...
             */
            verificationToken?: string;
        };
        /** @description 비밀번호 재설정 본인확인 응답 */
        PasswordResetVerifyResponse: {
            /**
             * @description 비밀번호 재설정 토큰
             * @example a1b2c3d4-...
             */
            resetToken?: string;
        };
        /** @description 로그인 요청 */
        LoginRequest: {
            /**
             * @description 이메일
             * @example user@magampick.com
             */
            email?: string;
            /**
             * @description 비밀번호
             * @example Abcd1234!
             */
            password?: string;
            /**
             * @description 로그인 상태 유지 (기본 ON — refresh 쿠키 max-age 30일, OFF 는 세션 쿠키)
             * @example true
             */
            keepSignedIn?: boolean;
        };
        /** @description 휴대폰 인증번호 발송 요청 */
        PhoneVerificationRequest: {
            /**
             * @description 휴대폰 번호
             * @example 010-1234-5678
             */
            phone?: string;
        };
        /** @description 휴대폰 인증번호 검증 요청 */
        PhoneVerificationConfirmRequest: {
            /**
             * @description 휴대폰 번호
             * @example 010-1234-5678
             */
            phone?: string;
            /**
             * @description 6자리 인증번호
             * @example 123456
             */
            code?: string;
        };
        /** @description 본인인증 토큰 응답 */
        PhoneVerificationTokenResponse: {
            /**
             * @description 본인인증 토큰. 회원가입·비밀번호 재설정에서 사용하며 15분 후 만료된다.
             * @example a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d
             */
            verificationToken?: string;
        };
        /** @description 비밀번호 재설정 완료 요청 */
        PasswordResetConfirmRequest: {
            /**
             * @description 본인확인 후 발급받은 재설정 토큰
             * @example a1b2c3d4-...
             */
            resetToken?: string;
            /**
             * @description 새 비밀번호
             * @example Newpass123!
             */
            newPassword?: string;
        };
        /** @description 카카오 로그인 요청 (인가 코드) */
        KakaoLoginRequest: {
            /**
             * @description 카카오 인가 코드
             * @example Q1w2E3r4t5...
             */
            authorizationCode?: string;
            /**
             * @description 인가 요청에 사용한 redirect URI (토큰 교환 시 동일 값 검증)
             * @example https://magampick.com/login/kakao/callback
             */
            redirectUri?: string;
        };
        /** @description 카카오 로그인 응답 (EXISTING=즉시 로그인 / NEW=추가정보 가입 필요) */
        KakaoAuthResponse: {
            /**
             * @description EXISTING(기존 회원) | NEW(신규 회원)
             * @example EXISTING
             */
            status?: string;
            /** @description [EXISTING] Access Token */
            accessToken?: string;
            /**
             * Format: int64
             * @description [EXISTING] Access Token 만료까지 남은 초
             * @example 1800
             */
            accessExpiresIn?: number;
            /** @description [NEW] 추가정보 가입용 소셜 토큰 */
            socialToken?: string;
            /** @description [NEW] 카카오 이메일 */
            email?: string;
            /** @description [NEW] 카카오 닉네임 (prefill) */
            nickname?: string;
        };
        /** @description 관리자 로그인 요청 */
        AdminLoginRequest: {
            /**
             * @description 사용자명
             * @example admin
             */
            username?: string;
            /**
             * @description 비밀번호
             * @example Admin1234!
             */
            password?: string;
        };
        CustomerProfileUpdateRequest: {
            /**
             * @description 닉네임
             * @example 마감픽유저
             */
            nickname?: string;
        };
        NotificationSettingUpdateRequest: {
            enabled: boolean;
        };
        CustomerNotificationSettingsResponse: {
            nearbyDeal?: boolean;
            favoriteStore?: boolean;
            orderRefund?: boolean;
            reviewReply?: boolean;
            eventBenefit?: boolean;
            marketing?: boolean;
        };
        /** @description 주소지 수정 요청 (부분 수정, 모든 필드 optional) */
        AddressUpdateRequest: {
            /**
             * @description 사용자 지정 라벨
             * @example 회사
             */
            label?: string;
            /** @description 도로명 주소 */
            roadAddress?: string;
            /** @description 지번 주소 */
            jibunAddress?: string;
            /** @description 상세 주소 */
            detailAddress?: string;
            /** @description 우편번호 5자리 */
            zonecode?: string;
            /** @description 시군구코드 (주소 변경 시 roadnameCode 와 함께 필수) */
            sigunguCode?: string;
            /** @description 도로명번호 (주소 변경 시 sigunguCode 와 함께 필수) */
            roadnameCode?: string;
            geocodeKeyValid?: boolean;
        };
        /** @description 비밀번호 변경 요청 */
        PasswordChangeRequest: {
            /**
             * @description 현재 비밀번호
             * @example Oldpass123!
             */
            currentPassword?: string;
            /**
             * @description 새 비밀번호
             * @example Newpass123!
             */
            newPassword?: string;
        };
        /** @description 약관 응답 */
        TermResponse: {
            /**
             * Format: int64
             * @description 약관 ID
             * @example 1
             */
            id?: number;
            /**
             * @description 약관 타입
             * @example TERMS_OF_SERVICE
             * @enum {string}
             */
            type?: "TERMS_OF_SERVICE" | "PRIVACY" | "LOCATION" | "AGE_14" | "AGE_19" | "MARKETING";
            /**
             * Format: int32
             * @description 약관 버전
             * @example 1
             */
            version?: number;
            /**
             * @description 약관 제목
             * @example 서비스 이용약관
             */
            title?: string;
            /** @description 약관 본문 */
            body?: string;
            /**
             * @description 필수 동의 여부
             * @example true
             */
            required?: boolean;
        };
        /** @description 매장 목록 아이템 */
        StoreListItemResponse: {
            /**
             * Format: int64
             * @description 매장 ID
             */
            id?: number;
            /** @description 매장명 */
            name?: string;
            /** @description 대표 이미지 URL (null = 없음) */
            imageUrl?: string;
            /**
             * Format: double
             * @description 직선 거리 (km)
             * @example 1.23
             */
            distanceKm?: number;
            /**
             * Format: double
             * @description 평점 평균 (0.0 = 리뷰 없음)
             * @example 4.5
             */
            rating?: number;
            /**
             * Format: int64
             * @description 진행중 마감할인 개수
             * @example 3
             */
            activeDealCount?: number;
            /** @description 단골 여부 */
            isFavorite?: boolean;
        };
        /** @description 소비자 매장 목록 응답 */
        StoreListResponse: {
            /** @description 매장 목록 */
            items?: components["schemas"]["StoreListItemResponse"][];
            /**
             * Format: int32
             * @description 현재 페이지 (0-based)
             * @example 0
             */
            page?: number;
            /**
             * Format: int32
             * @description 페이지당 아이템 수
             * @example 20
             */
            size?: number;
            /** @description 다음 페이지 존재 여부 */
            hasNext?: boolean;
            /**
             * Format: int64
             * @description 전체 후보 매장 수 (5km 이내 OPEN 오늘영업)
             * @example 12
             */
            total?: number;
            /**
             * Format: int64
             * @description 활성 떨이가 있는 매장 수
             * @example 5
             */
            dealStoreCount?: number;
        };
        /** @description 소비자 매장 상세 응답 */
        ConsumerStoreDetailResponse: {
            /**
             * Format: int64
             * @description 매장 ID
             * @example 1
             */
            id?: number;
            /**
             * @description 매장 이름
             * @example 동네빵집
             */
            name?: string;
            /** @description 대표 이미지 URL (없으면 null) */
            imageUrl?: string;
            /**
             * @description 현재 영업 상태 (OPEN/BREAK/CLOSED_TODAY)
             * @enum {string}
             */
            businessStatus?: "OPEN" | "BREAK" | "CLOSED_TODAY";
            /**
             * @description 오늘 영업 종료 시각 (HH:mm). 오늘 휴무이면 null
             * @example 21:00
             */
            closingTime?: string;
            /**
             * Format: double
             * @description 평균 평점
             * @example 4.3
             */
            rating?: number;
            /**
             * Format: int64
             * @description 리뷰 수
             * @example 12
             */
            reviewCount?: number;
            /**
             * Format: double
             * @description 기본 주소지에서의 거리 (km)
             * @example 1.2
             */
            distanceKm?: number;
            /** @description 단골 여부 */
            isFavorite?: boolean;
            /**
             * @description 도로명+상세 주소
             * @example 서울시 중구 세종대로 110
             */
            address?: string;
            /**
             * @description 전화번호
             * @example 02-1234-5678
             */
            phone?: string;
            /**
             * @description 사업자 번호
             * @example 1234567890
             */
            businessNumber?: string;
            /** @description 영업시간 (월~일 7개) */
            operatingHours?: components["schemas"]["OperatingHourResponse"][];
            /**
             * Format: double
             * @description 매장 위도 (WGS84)
             * @example 37.5665
             */
            lat?: number;
            /**
             * Format: double
             * @description 매장 경도 (WGS84)
             * @example 126.978
             */
            lng?: number;
        };
        /** @description 영업시간 (요일 1건) */
        OperatingHourResponse: {
            /**
             * @description 요일 (월/화/수/목/금/토/일)
             * @example 월
             */
            day?: string;
            /**
             * @description 오픈 시각 (HH:mm). 휴무이면 null
             * @example 09:00
             */
            open?: string;
            /**
             * @description 마감 시각 (HH:mm). 휴무이면 null
             * @example 21:00
             */
            close?: string;
            /**
             * @description 휴무 여부. true = 해당 요일 영업 없음
             * @example false
             */
            closed?: boolean;
        };
        Pageable: {
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            size?: number;
            sort?: string[];
        };
        SliceResponseStoreReviewResponse: {
            content?: components["schemas"]["StoreReviewResponse"][];
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            size?: number;
            hasNext?: boolean;
        };
        /** @description 매장 리뷰 목록 아이템 */
        StoreReviewResponse: {
            /**
             * Format: int64
             * @description 리뷰 ID
             */
            id?: number;
            /** @description 작성자 닉네임 */
            authorNickname?: string;
            /**
             * Format: int32
             * @description 별점 (1-5)
             */
            rating?: number;
            /** @description 리뷰 내용 */
            content?: string;
            /**
             * Format: date-time
             * @description 작성 시각
             */
            createdAt?: string;
            /** @description 주문한 떨이 상품 목록 */
            products?: components["schemas"]["ReviewedProduct"][];
            /** @description 리뷰 사진 URL 목록 (sort_order 오름차순) */
            photos?: string[];
            /** @description 리뷰 태그 한국어 라벨 목록 */
            tags?: string[];
            /** @description 사장 답글 (없으면 null) */
            ownerReply?: string;
        };
        /** @description 매장 리뷰 요약 (평점 평균 + 분포) */
        ReviewSummaryResponse: {
            /**
             * Format: double
             * @description 평균 별점 (리뷰 없으면 0.0)
             */
            average?: number;
            /**
             * Format: int64
             * @description 총 리뷰 수
             */
            count?: number;
            /** @description 별점 분포 (5점 → 1점 순 5개, 없는 별점도 count=0 으로 포함) */
            distribution?: components["schemas"]["StarCount"][];
        };
        /** @description 별점별 리뷰 수 */
        StarCount: {
            /**
             * Format: int32
             * @description 별점 (1-5)
             */
            star?: number;
            /**
             * Format: int64
             * @description 해당 별점 리뷰 수
             */
            count?: number;
        };
        /** @description 소비자 메뉴 탭 — 판매중 상품 카드 (flat 리스트, FE 가 category 로 그룹화) */
        StoreMenuItemResponse: {
            /**
             * Format: int64
             * @description 상품 ID
             */
            id?: number;
            /** @description 상품 이름 */
            name?: string;
            /** @description 이미지 URL (없으면 null) */
            imageUrl?: string;
            /** @description 정상가 (원) */
            price?: number;
            /**
             * @description 카테고리 한국어 라벨
             * @example 베이커리
             */
            category?: string;
        };
        /** @description 소비자 마감할인 탭 — 활성 떨이 카드 */
        StoreDealResponse: {
            /**
             * Format: int64
             * @description 떨이 ID
             */
            id?: number;
            /** @description 떨이 이름 */
            name?: string;
            /** @description 상품 이미지 URL (없으면 null) */
            imageUrl?: string;
            /**
             * Format: int32
             * @description 할인율 (%)
             * @example 30
             */
            discountRate?: number;
            /** @description 정상가 (원) */
            originalPrice?: number;
            /** @description 판매가 (원) */
            salePrice?: number;
            /**
             * Format: date-time
             * @description 픽업 마감 일시 (ISO-8601)
             */
            pickupDeadline?: string;
            /**
             * Format: int32
             * @description 잔여 수량
             */
            stockLeft?: number;
        };
        /** @description 우리 동네 마감픽 매장 카드 */
        NeighborhoodStoreResponse: {
            /**
             * Format: int64
             * @description 매장 ID
             */
            id?: number;
            /** @description 매장명 */
            name?: string;
            /** @description 매장 대표 이미지 URL (없으면 null) */
            imageUrl?: string;
            /**
             * Format: double
             * @description 거리 (km, 기본 주소지 기준)
             */
            distanceKm?: number;
            /**
             * Format: double
             * @description 평균 별점 (0.0 = 리뷰 없음)
             */
            rating?: number;
            /**
             * Format: int64
             * @description 진행중 마감할인 개수
             */
            activeDealCount?: number;
        };
        MapStoreResponse: {
            /** Format: int64 */
            id?: number;
            name?: string;
            imageUrl?: string;
            /** Format: double */
            latitude?: number;
            /** Format: double */
            longitude?: number;
            /** Format: double */
            distanceKm?: number;
            /** Format: double */
            rating?: number;
            /** Format: int64 */
            activeDealCount?: number;
            /** Format: int32 */
            maxDiscountRate?: number;
        };
        /** @description 떨이 아이템 */
        DealSearchItem: components["schemas"]["SearchProductItemBase"] & {
            /**
             * @description kind 판별자
             * @example deal
             */
            kind?: string;
            /**
             * Format: int64
             * @description 떨이 ID
             */
            id?: number;
            /**
             * Format: int64
             * @description 매장 ID
             */
            storeId?: number;
            /** @description 매장명 */
            storeName?: string;
            /** @description 상품명 */
            name?: string;
            /** @description 이미지 URL (nullable) */
            imageUrl?: string;
            /** @description 정상가 (원) */
            originalPrice?: number;
            /** @description 판매가 (원) */
            salePrice?: number;
            /**
             * Format: int32
             * @description 할인율 (%)
             * @example 40
             */
            discountRate?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "deal";
        };
        /** @description 메뉴 아이템 */
        MenuSearchItem: components["schemas"]["SearchProductItemBase"] & {
            /**
             * @description kind 판별자
             * @example menu
             */
            kind?: string;
            /**
             * Format: int64
             * @description 상품 ID
             */
            id?: number;
            /**
             * Format: int64
             * @description 매장 ID
             */
            storeId?: number;
            /** @description 매장명 */
            storeName?: string;
            /** @description 상품명 */
            name?: string;
            /** @description 이미지 URL (nullable) */
            imageUrl?: string;
            /** @description 정상가 (원) */
            price?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "menu";
        };
        /** @description 검색 결과 상품 아이템 공통 필드 */
        SearchProductItemBase: {
            /** @description kind 판별자 (deal | menu) */
            kind?: string;
            /**
             * Format: int64
             * @description 매장 ID
             */
            storeId?: number;
            /** @description 매장명 */
            storeName?: string;
            /** @description 상품명 */
            name?: string;
            /** @description 이미지 URL (nullable) */
            imageUrl?: string;
        };
        /** @description 검색 결과 상품 아이템 (kind: deal | menu) */
        SearchProductItemResponse: components["schemas"]["DealSearchItem"] | components["schemas"]["MenuSearchItem"];
        /** @description 검색 결과 */
        SearchResultResponse: {
            /** @description 매장 목록 */
            stores?: components["schemas"]["StoreListItemResponse"][];
            /** @description 상품 목록 (kind: deal | menu) */
            products?: components["schemas"]["SearchProductItemResponse"][];
        };
        /** @description 자동완성 제안 아이템 */
        SearchSuggestionResponse: {
            /**
             * @description 제안 종류 (store | product)
             * @example store
             * @enum {string}
             */
            kind?: "store" | "product";
            /** @description 제안 텍스트 */
            text?: string;
        };
        /** @description 소비자 일반 상품 상세 응답 (kind=menu) */
        MenuProductDetailResponse: {
            /**
             * @description 상품 종류 구분자
             * @example menu
             */
            kind?: string;
            /**
             * Format: int64
             * @description 상품 ID
             */
            id?: number;
            /**
             * Format: int64
             * @description 매장 ID
             */
            storeId?: number;
            /** @description 매장명 */
            storeName?: string;
            /**
             * Format: double
             * @description 기본 주소지에서의 거리 (km)
             * @example 0.8
             */
            distanceKm?: number;
            /**
             * @description 매장 영업 상태 (OPEN/BREAK/CLOSED_TODAY)
             * @enum {string}
             */
            businessStatus?: "OPEN" | "BREAK" | "CLOSED_TODAY";
            /** @description 상품 이미지 URL (없으면 null) */
            imageUrl?: string;
            /** @description 상품명 */
            name?: string;
            /** @description 상품 설명 (없으면 null) */
            description?: string;
            /**
             * Format: double
             * @description 평균 평점 (일반 상품은 항상 0.0)
             * @example 0
             */
            rating?: number;
            /**
             * Format: int64
             * @description 리뷰 수 (일반 상품은 항상 0)
             * @example 0
             */
            reviewCount?: number;
            /**
             * @description 오늘 영업 종료 시각 (HH:mm). 오늘 휴무이면 null
             * @example 21:00
             */
            closingTime?: string;
            /** @description 가격 (원) */
            price?: number;
            /** @description 판매 여부 (ON_SALE=true) */
            isOnSale?: boolean;
        };
        /** @description 주문 상품 아이템 */
        OrderedItem: {
            /**
             * Format: int64
             * @description 상품 ID
             */
            productId?: number;
            /** @description 상품 종류 (deal / menu) */
            kind?: string;
            /** @description 상품명 */
            name?: string;
        };
        /** @description 리뷰 작성 가능한 완료 주문 아이템 */
        ReviewableOrderResponse: {
            /**
             * Format: int64
             * @description 주문 ID
             */
            orderId?: number;
            /**
             * Format: int64
             * @description 매장 ID
             */
            storeId?: number;
            /** @description 매장명 */
            storeName?: string;
            /** @description 주문 상품 목록 */
            items?: components["schemas"]["OrderedItem"][];
            /**
             * Format: date-time
             * @description 픽업 완료 시각
             */
            pickedUpAt?: string;
            /** @description 리뷰 작성 여부 */
            reviewed?: boolean;
            /**
             * Format: int64
             * @description 리뷰 ID (리뷰 없으면 null)
             */
            reviewId?: number;
        };
        /** @description FAQ 응답 */
        FaqResponse: {
            /**
             * Format: int64
             * @description FAQ ID
             */
            id?: number;
            /** @description 질문 */
            question?: string;
            /** @description 답변 */
            answer?: string;
        };
        CustomerStatsResponse: {
            /** Format: int64 */
            monthlySavings?: number;
            /** Format: int32 */
            rescuedCount?: number;
            /** Format: int32 */
            favoriteCount?: number;
        };
        PointSummaryResponse: {
            /**
             * Format: int64
             * @description 사용 가능 포인트 잔액
             */
            balance?: number;
        };
        /** @description 포인트 내역 응답 */
        PointTransactionResponse: {
            /**
             * Format: int64
             * @description 내역 ID
             */
            id?: number;
            /**
             * @description 사유 (EARN/USE/EXPIRE/RESTORE/CLAWBACK)
             * @enum {string}
             */
            reason?: "EARN" | "USE" | "EXPIRE" | "RESTORE" | "CLAWBACK";
            /**
             * Format: int64
             * @description 포인트 변동량 (양수)
             */
            amount?: number;
            /** @description 연관 매장 이름 (없으면 null) */
            storeName?: string;
            /**
             * Format: date-time
             * @description 내역 발생 시각
             */
            occurredAt?: string;
        };
        NotificationListResponse: {
            items?: components["schemas"]["NotificationResponse"][];
        };
        NotificationResponse: {
            /** Format: int64 */
            id?: number;
            category?: string;
            title?: string;
            body?: string;
            createdAt?: string;
            read?: boolean;
            link?: string;
        };
        UnreadCountResponse: {
            /** Format: int64 */
            count?: number;
        };
        /** @description 단골 매장 목록 응답 */
        FavoriteListResponse: {
            /** @description 단골 매장 목록 */
            stores?: components["schemas"]["FavoriteStoreResponse"][];
            /**
             * Format: int64
             * @description 총 단골 수
             * @example 5
             */
            totalCount?: number;
            /**
             * Format: int64
             * @description 전체 단골의 활성 마감할인 합계
             * @example 8
             */
            totalActiveDealCount?: number;
        };
        /** @description 단골 매장 목록 아이템 */
        FavoriteStoreResponse: {
            /**
             * Format: int64
             * @description 매장 ID
             * @example 1
             */
            id?: number;
            /**
             * @description 매장명
             * @example 동네빵집
             */
            name?: string;
            /** @description 매장 이미지 URL */
            imageUrl?: string;
            /**
             * Format: double
             * @description 기본 주소지 기준 거리 (km)
             * @example 1.23
             */
            distanceKm?: number;
            /**
             * Format: double
             * @description 매장 평균 별점
             * @example 4.5
             */
            rating?: number;
            /**
             * Format: int64
             * @description 활성 마감할인 개수
             * @example 3
             */
            activeDealCount?: number;
        };
        CouponEventResponse: {
            /**
             * Format: int64
             * @description 쿠폰 마스터 ID
             */
            couponId?: number;
            /**
             * @description 할인 방식
             * @enum {string}
             */
            discountType?: "RATE" | "AMOUNT";
            /**
             * Format: int32
             * @description 할인 값 (RATE=%, AMOUNT=원)
             */
            value?: number;
            /**
             * Format: int32
             * @description 최소 주문 금액
             */
            minOrder?: number;
            /** @description 쿠폰 이름 */
            label?: string;
            /**
             * Format: date
             * @description 만료일 (마스터 valid_until)
             */
            expiresAt?: string;
            /** @description 이미 발급 받았으면 true */
            claimed?: boolean;
        };
        /** @description 소비자 떨이 상품 상세 응답 (kind=deal) */
        DealProductDetailResponse: {
            /**
             * @description 상품 종류 구분자
             * @example deal
             */
            kind?: string;
            /**
             * Format: int64
             * @description 떨이 상품 ID
             */
            id?: number;
            /**
             * Format: int64
             * @description 매장 ID
             */
            storeId?: number;
            /** @description 매장명 */
            storeName?: string;
            /**
             * Format: double
             * @description 기본 주소지에서의 거리 (km)
             * @example 1.2
             */
            distanceKm?: number;
            /**
             * @description 매장 영업 상태 (OPEN/BREAK/CLOSED_TODAY)
             * @enum {string}
             */
            businessStatus?: "OPEN" | "BREAK" | "CLOSED_TODAY";
            /** @description 상품 이미지 URL (없으면 null) */
            imageUrl?: string;
            /** @description 상품명 */
            name?: string;
            /** @description 상품 설명 (없으면 null) */
            description?: string;
            /**
             * Format: double
             * @description 평균 평점
             * @example 4.3
             */
            rating?: number;
            /**
             * Format: int64
             * @description 리뷰 수
             * @example 12
             */
            reviewCount?: number;
            /**
             * @description 오늘 영업 종료 시각 (HH:mm). 오늘 휴무이면 null
             * @example 21:00
             */
            closingTime?: string;
            /** @description 정상가 (원) */
            originalPrice?: number;
            /** @description 판매가 (원) */
            salePrice?: number;
            /**
             * Format: int32
             * @description 할인율 (%)
             * @example 33
             */
            discountRate?: number;
            /**
             * Format: date-time
             * @description 픽업 마감 일시 (ISO-8601)
             */
            pickupDeadline?: string;
            /**
             * Format: int32
             * @description 잔여 수량
             */
            stockLeft?: number;
            /** @description 떨이 상태 (ACTIVE/SOLD_OUT/EXPIRED) */
            dealStatus?: string;
        };
        /** @description 마감 임박 특가 떨이 카드 */
        ClosingDealResponse: {
            /**
             * Format: int64
             * @description 떨이 상품 ID
             */
            id?: number;
            /** @description 매장명 */
            storeName?: string;
            /** @description 상품명 (떨이 이름) */
            productName?: string;
            /** @description 상품 이미지 URL (없으면 null) */
            imageUrl?: string;
            /**
             * Format: int32
             * @description 할인율 (정수 %, 반올림)
             */
            discountRate?: number;
            /** @description 정가 */
            originalPrice?: number;
            /** @description 할인가 */
            salePrice?: number;
            /**
             * Format: date-time
             * @description 픽업 마감 시각 (FE 카운트다운 기준)
             */
            pickupDeadline?: string;
        };
        /** @description 이메일 사용 가능 여부 응답 */
        EmailAvailabilityResponse: {
            /**
             * @description 사용 가능 여부
             * @example true
             */
            available?: boolean;
        };
        /** @description 공지사항 응답 */
        AnnouncementResponse: {
            /**
             * Format: int64
             * @description 공지사항 ID
             */
            id?: number;
            /**
             * @description 태그 (notice / event / update)
             * @enum {string}
             */
            tag?: "notice" | "event" | "update";
            /** @description 핀 여부 */
            pinned?: boolean;
            /**
             * Format: date
             * @description 발행일 (yyyy-MM-dd)
             */
            date?: string;
            /** @description 제목 */
            title?: string;
            /** @description 본문 */
            body?: string;
        };
        /** @description FCM 토큰 해제 요청 */
        PushTokenDeleteRequest: {
            /** @description 해제할 FCM 디바이스 토큰 */
            token?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    updateReview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 리뷰 ID */
                reviewId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateReviewRequest"];
            };
        };
        responses: {
            /** @description 수정 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MyReviewResponse"];
                };
            };
            /** @description 답글 잠금 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MyReviewResponse"];
                };
            };
        };
    };
    deleteReview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 리뷰 ID */
                reviewId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 삭제 성공 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 답글 잠금 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushTokenRegisterRequest"];
            };
        };
        responses: {
            /** @description 등록 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PushTokenResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PushTokenResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PushTokenResponse"];
                };
            };
        };
    };
    unregister: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushTokenDeleteRequest"];
            };
        };
        responses: {
            /** @description 해제 성공 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirmTossPayment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TossConfirmRequest"];
            };
        };
        responses: {
            /** @description 결제 확인 성공, 주문 PENDING 활성화 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 금액 불일치 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 결제 대기 상태가 아님 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 토스 API 오류 */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
        };
    };
    listMyOrders: {
        parameters: {
            query?: {
                segment?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"][];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"][];
                };
            };
        };
    };
    createOrder: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateOrderRequest"];
            };
        };
        responses: {
            /** @description 주문 준비 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PrepareOrderResponse"];
                };
            };
            /** @description 입력 검증 실패 / 결제 미동의 / 금액 불일치 / 픽업 시간 오류 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PrepareOrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PrepareOrderResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PrepareOrderResponse"];
                };
            };
            /** @description 매장/상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PrepareOrderResponse"];
                };
            };
            /** @description 매장 영업 중지 / 재고 부족 / 떨이 마감 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PrepareOrderResponse"];
                };
            };
        };
    };
    createReview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 주문 ID */
                orderId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReviewRequest"];
            };
        };
        responses: {
            /** @description 리뷰 작성 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MyReviewResponse"];
                };
            };
            /** @description 이미 리뷰 존재 / COMPLETED 아님 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MyReviewResponse"];
                };
            };
        };
    };
    requestRefund: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                orderId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefundRequestRequest"];
            };
        };
        responses: {
            /** @description 환불 요청 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 사유 없음 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 미완료 주문 / 기간 초과 / 중복 요청 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
        };
    };
    cancelOrder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 취소 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 허용되지 않는 상태 전이 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
        };
    };
    me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DevPushMeRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DevPushMeResponse"];
                };
            };
        };
    };
    echo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DevPushEchoRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DevPushResponse"];
                };
            };
        };
    };
    updatePhone: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomerPhoneUpdateRequest"];
            };
        };
        responses: {
            /** @description 변경 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerProfileResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerProfileResponse"];
                };
            };
        };
    };
    list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"][];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"][];
                };
            };
        };
    };
    create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InquiryCreateRequest"];
            };
        };
        responses: {
            /** @description 생성 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
        };
    };
    list_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteListResponse"];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteListResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteListResponse"];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteListResponse"];
                };
            };
        };
    };
    add: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FavoriteAddRequest"];
            };
        };
        responses: {
            /** @description 등록 성공 (이미 등록된 경우도 201) */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteAddResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteAddResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteAddResponse"];
                };
            };
            /** @description 권한 없음 또는 미승인 매장 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteAddResponse"];
                };
            };
            /** @description 매장 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FavoriteAddResponse"];
                };
            };
        };
    };
    claim: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                couponId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 발급 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponResponse"];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponResponse"];
                };
            };
            /** @description 쿠폰 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponResponse"];
                };
            };
            /** @description 이미 받음 / 마감 / 발급 불가 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponResponse"];
                };
            };
        };
    };
    list_2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"][];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"][];
                };
            };
        };
    };
    create_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddressCreateRequest"];
            };
        };
        responses: {
            /** @description 등록 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 검증 실패 또는 지오코딩 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
        };
    };
    markAsDefault: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 기본 주소지로 지정할 주소지 ID
                 * @example 1
                 */
                addressId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 변경 성공 (또는 이미 기본 주소지인 멱등 응답) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 권한 없음 또는 본인 소유 아님 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 주소지를 찾을 수 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
        };
    };
    reverseGeocode: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddressReverseGeocodeRequest"];
            };
        };
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressReverseGeocodeResponse"];
                };
            };
            /** @description 검증 실패 또는 매칭 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressReverseGeocodeResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressReverseGeocodeResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressReverseGeocodeResponse"];
                };
            };
        };
    };
    signupCustomer: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomerSignupRequest"];
            };
        };
        responses: {
            /** @description 회원가입 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 로그인 상태 진입 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 이메일 중복 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
        };
    };
    signupSocial: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SocialSignupRequest"];
            };
        };
        responses: {
            /** @description 가입 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 입력 검증 실패 / 소셜 토큰 만료 / 본인인증 미완료 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 로그인 상태 진입 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 카카오 이메일이 기존 계정과 충돌 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
        };
    };
    verifyBusiness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BusinessVerificationRequest"];
            };
        };
        responses: {
            /** @description 진위확인 통과 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 입력 검증 실패 / 사업자 번호 형식 오류 / 진위확인 불일치 / 정상 영업 아님 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 사업자 번호 검증 일시 실패 (재시도 안내) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    signupSeller: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    request: components["schemas"]["SellerSignupRequest"];
                    /** Format: binary */
                    image?: string;
                };
            };
        };
        responses: {
            /** @description 회원가입 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 로그인 상태 진입 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 이메일 중복 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
        };
    };
    verifySellerPasswordResetIdentity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetVerifyRequest"];
            };
        };
        responses: {
            /** @description 본인확인 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PasswordResetVerifyResponse"];
                };
            };
            /** @description 입력 검증 실패 또는 본인확인 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PasswordResetVerifyResponse"];
                };
            };
        };
    };
    loginSeller: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description 로그인 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 인증 실패 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
        };
    };
    refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 갱신 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description refresh 쿠키 없음/만료/무효 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
        };
    };
    request: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneVerificationRequest"];
            };
        };
        responses: {
            /** @description 발송 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 휴대폰 번호 형식 오류 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 재발송 제한 또는 일일 한도 초과 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SMS 발송 실패 */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirm: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneVerificationConfirmRequest"];
            };
        };
        responses: {
            /** @description 검증 성공 — 본인인증 토큰 발급 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PhoneVerificationTokenResponse"];
                };
            };
            /** @description 인증번호 불일치/만료 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PhoneVerificationTokenResponse"];
                };
            };
            /** @description 검증 시도 횟수 초과 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PhoneVerificationTokenResponse"];
                };
            };
        };
    };
    verifyCustomerPasswordResetIdentity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetVerifyRequest"];
            };
        };
        responses: {
            /** @description 본인확인 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PasswordResetVerifyResponse"];
                };
            };
            /** @description 입력 검증 실패 또는 본인확인 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PasswordResetVerifyResponse"];
                };
            };
            /** @description 소셜 전용 계정 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PasswordResetVerifyResponse"];
                };
            };
        };
    };
    resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetConfirmRequest"];
            };
        };
        responses: {
            /** @description 변경 성공 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 입력 검증 실패 또는 재설정 토큰 만료 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 로그아웃 성공 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    loginCustomer: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description 로그인 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 인증 실패 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
        };
    };
    kakaoLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["KakaoLoginRequest"];
            };
        };
        responses: {
            /** @description 기존 회원 로그인 / 신규 회원 추가정보 가입 필요 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["KakaoAuthResponse"];
                };
            };
            /** @description 입력 검증 실패 / 카카오 이메일 미동의 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["KakaoAuthResponse"];
                };
            };
            /** @description 카카오 이메일이 기존 계정과 충돌 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["KakaoAuthResponse"];
                };
            };
            /** @description 카카오 OAuth 인증 실패 */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["KakaoAuthResponse"];
                };
            };
        };
    };
    loginAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminLoginRequest"];
            };
        };
        responses: {
            /** @description 로그인 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
            /** @description 인증 실패 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TokenResponse"];
                };
            };
        };
    };
    getProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerProfileResponse"];
                };
            };
            /** @description 소비자 미존재 또는 탈퇴 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerProfileResponse"];
                };
            };
        };
    };
    updateProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CustomerProfileUpdateRequest"];
            };
        };
        responses: {
            /** @description 수정 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerProfileResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerProfileResponse"];
                };
            };
            /** @description 소비자 미존재 또는 탈퇴 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerProfileResponse"];
                };
            };
        };
    };
    markRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    markAllRead: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    updateSetting: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotificationSettingUpdateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerNotificationSettingsResponse"];
                };
            };
        };
    };
    delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 주소지 ID
                 * @example 1
                 */
                addressId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 삭제 성공 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 권한 없음 또는 본인 소유 아님 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 주소지를 찾을 수 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description 주소지 ID
                 * @example 1
                 */
                addressId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddressUpdateRequest"];
            };
        };
        responses: {
            /** @description 수정 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 권한 없음 또는 본인 소유 아님 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
            /** @description 주소지를 찾을 수 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AddressResponse"];
                };
            };
        };
    };
    changePassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordChangeRequest"];
            };
        };
        responses: {
            /** @description 변경 성공 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 입력 검증 실패 또는 현재 비밀번호 불일치 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 미인증 또는 refresh 쿠키 없음 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getTerms: {
        parameters: {
            query?: {
                /**
                 * @description 가입 역할. SELLER면 사장 약관(AGE_19)을 조회
                 * @example SELLER
                 */
                role?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TermResponse"][];
                };
            };
        };
    };
    list_3: {
        parameters: {
            query?: {
                sort?: string;
                page?: number;
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreListResponse"];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreListResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreListResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreListResponse"];
                };
            };
        };
    };
    detail: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConsumerStoreDetailResponse"];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConsumerStoreDetailResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConsumerStoreDetailResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConsumerStoreDetailResponse"];
                };
            };
            /** @description 매장 없음 (STORE_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ConsumerStoreDetailResponse"];
                };
            };
        };
    };
    getReviews: {
        parameters: {
            query: {
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path: {
                /** @description 매장 ID */
                storeId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SliceResponseStoreReviewResponse"];
                };
            };
        };
    };
    getReviewSummary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 매장 ID */
                storeId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ReviewSummaryResponse"];
                };
            };
        };
    };
    menu: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreMenuItemResponse"][];
                };
            };
        };
    };
    deals: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreDealResponse"][];
                };
            };
        };
    };
    neighborhood: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["NeighborhoodStoreResponse"][];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["NeighborhoodStoreResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["NeighborhoodStoreResponse"][];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["NeighborhoodStoreResponse"][];
                };
            };
        };
    };
    map: {
        parameters: {
            query: {
                latitude: number;
                longitude: number;
                radiusKm: number;
                dealsOnly: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MapStoreResponse"][];
                };
            };
            /** @description radiusKm 값 오류 (INVALID_INPUT: 1/3/5 이외) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MapStoreResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MapStoreResponse"][];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MapStoreResponse"][];
                };
            };
        };
    };
    search: {
        parameters: {
            query?: {
                q?: string;
                sort?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 검색 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SearchResultResponse"];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SearchResultResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SearchResultResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SearchResultResponse"];
                };
            };
        };
    };
    autocomplete: {
        parameters: {
            query?: {
                q?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 자동완성 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SearchSuggestionResponse"][];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SearchSuggestionResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SearchSuggestionResponse"][];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SearchSuggestionResponse"][];
                };
            };
        };
    };
    detail_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                productId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MenuProductDetailResponse"];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MenuProductDetailResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MenuProductDetailResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MenuProductDetailResponse"];
                };
            };
            /** @description 상품 없음 (PRODUCT_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MenuProductDetailResponse"];
                };
            };
        };
    };
    getOrderReview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 주문 ID */
                orderId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MyReviewResponse"];
                };
            };
            /** @description 리뷰 없음 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MyReviewResponse"];
                };
            };
        };
    };
    getMyOrder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OrderResponse"];
                };
            };
        };
    };
    getReviewableOrders: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ReviewableOrderResponse"][];
                };
            };
        };
    };
    list_4: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FaqResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FaqResponse"][];
                };
            };
        };
    };
    getStats: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerStatsResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerStatsResponse"];
                };
            };
            /** @description 소비자 역할 아님 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerStatsResponse"];
                };
            };
        };
    };
    getMyReviews: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MyReviewResponse"][];
                };
            };
        };
    };
    getSummary: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PointSummaryResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PointSummaryResponse"];
                };
            };
        };
    };
    getHistory: {
        parameters: {
            query?: {
                filter?: "EARN" | "USE" | "ALL";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PointTransactionResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PointTransactionResponse"][];
                };
            };
        };
    };
    list_5: {
        parameters: {
            query?: {
                segment?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["NotificationListResponse"];
                };
            };
        };
    };
    unreadCount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UnreadCountResponse"];
                };
            };
        };
    };
    getSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CustomerNotificationSettingsResponse"];
                };
            };
        };
    };
    get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                inquiryId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
            /** @description 문의 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InquiryResponse"];
                };
            };
        };
    };
    getMyCoupons: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponResponse"][];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponResponse"][];
                };
            };
        };
    };
    getEvents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponEventResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponEventResponse"][];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CouponEventResponse"][];
                };
            };
        };
    };
    detail_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                clearanceItemId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DealProductDetailResponse"];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DealProductDetailResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DealProductDetailResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DealProductDetailResponse"];
                };
            };
            /** @description 떨이 없음 (CLEARANCE_ITEM_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["DealProductDetailResponse"];
                };
            };
        };
    };
    closingSoon: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClosingDealResponse"][];
                };
            };
            /** @description 기본 주소지 없음 (DEFAULT_ADDRESS_REQUIRED) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClosingDealResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClosingDealResponse"][];
                };
            };
            /** @description 권한 없음 (ROLE_CUSTOMER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClosingDealResponse"][];
                };
            };
        };
    };
    checkEmailAvailability: {
        parameters: {
            query: {
                role?: "CUSTOMER" | "SELLER" | "ADMIN";
                email: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 사용 가능 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["EmailAvailabilityResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["EmailAvailabilityResponse"];
                };
            };
            /** @description 이메일 중복 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["EmailAvailabilityResponse"];
                };
            };
        };
    };
    list_6: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 조회 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AnnouncementResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AnnouncementResponse"][];
                };
            };
        };
    };
    remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 해제 성공 (미등록 상태여도 204) */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
