/**
 * AUTO-GENERATED — 직접 수정 금지.
 * SpringDoc OpenAPI group: 2. Seller (사장)
 * 재생성: pnpm --filter @magampick/api-types gen
 */

export interface paths {
    "/api/v1/seller/stores/{storeId}/business-hours": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 매장 영업시간 조회
         * @description 본인 매장의 요일별 영업시간 (영업 요일만 — 휴무 요일은 응답에 없음)을 조회한다.
         */
        get: operations["getBusinessHours"];
        /**
         * 매장 영업시간 저장
         * @description 본인 매장의 요일별 영업시간을 전체 교체로 저장한다 (영업 요일만 list 에 포함, 빈 list 도 허용). 영업 상태 OPEN 중 오늘 요일 시간 수정·삭제는 거부, 다른 요일·오늘 신규 추가는 허용.
         */
        put: operations["saveBusinessHours"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 본인 매장 목록 조회
         * @description 본인 소유 매장 전체 목록을 조회한다.
         */
        get: operations["list"];
        put?: never;
        /**
         * 매장 등록
         * @description 사업자 검증 + 자체 DB 주소 지오코딩 + 선택 대표 사진 OCI 업로드 후 자동 승인으로 매장을 즉시 생성한다. operation_status 초기값은 CLOSED_TODAY.
         */
        post: operations["register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 본인 매장 상품 목록 조회
         * @description 본인 매장의 일반 상품 목록을 페이지네이션으로 조회한다.
         */
        get: operations["list_1"];
        put?: never;
        /**
         * 일반 상품 등록
         * @description 본인 매장에 일반 상품을 등록한다. 매장이 APPROVED 상태여야 한다.
         */
        post: operations["register_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/products/{productId}/sold-out": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 상품 품절 처리
         * @description 상품을 SOLD_OUT 상태로 변경한다. 이미 품절이면 변경 없이 200 반환.
         */
        post: operations["soldOut"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/products/{productId}/restock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 상품 재입고 처리
         * @description 상품을 ON_SALE 상태로 변경한다. 이미 판매 중이면 변경 없이 200 반환.
         */
        post: operations["restock"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/clearance-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 본인 매장 마감 임박 상품 목록 조회
         * @description 본인 매장의 마감 임박 상품 목록을 페이지네이션으로 조회한다.
         */
        get: operations["list_2"];
        put?: never;
        /**
         * 마감 임박 상품 등록
         * @description 일반 상품을 마감 임박 상품으로 전환·등록한다. 매장이 APPROVED 상태여야 하며 원본 상품은 ON_SALE 이어야 한다.
         */
        post: operations["register_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/clearance-items/{clearanceItemId}/close": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 마감 임박 상품 수동 마감
         * @description OPEN 상태인 떨이를 CLOSED 로 전환한다. 이미 CLOSED 면 변경 없이 200 반환 (멱등).
         */
        post: operations["close"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/business-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 사업자 진위확인
         * @description 국세청 사업자등록 API로 사업자 정보를 검증한다. 기본 status 모드는 사업자번호의 정상 영업 여부를 확인하고, validate 모드에서는 사업자번호·대표자명·개업일자 세 값의 일치 여부까지 확인한다. 매장 등록 폼의 [조회하기] 버튼 대응.
         */
        post: operations["verifyBusiness"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/reviews/{reviewId}/reply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 사장 답글 작성
         * @description 본인 매장의 리뷰에만 답글 작성 가능. 리뷰당 1개. 201 + 답글 포함된 리뷰 반환.
         */
        post: operations["replyToReview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/refunds/{refundId}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 환불 거부
         * @description REQUESTED 상태의 환불 요청을 거부한다. 거부 사유 필수. ROLE_SELLER 인증 필요.
         */
        post: operations["rejectRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/refunds/{refundId}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 환불 승인
         * @description REQUESTED 상태의 환불 요청을 승인한다. 본인 매장 주문만 가능. ROLE_SELLER 인증 필요.
         */
        post: operations["approveRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/orders/{id}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 주문 거절
         * @description 사장 본인 매장 주문 거절. PENDING → REJECTED. 자동 환불 stub. ROLE_SELLER 인증 필요.
         */
        post: operations["rejectOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/orders/{id}/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 준비완료
         * @description 사장 본인 매장 주문 준비완료. PREPARING → READY. ROLE_SELLER 인증 필요.
         */
        post: operations["readyOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/orders/{id}/no-show": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 미수령
         * @description 사장 본인 매장 주문 미수령 처리. READY → NO_SHOW. ROLE_SELLER 인증 필요.
         */
        post: operations["noShowOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/orders/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 수령완료
         * @description 사장 본인 매장 주문 수령완료. READY → COMPLETED. ROLE_SELLER 인증 필요.
         */
        post: operations["completeOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/orders/{id}/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 주문 수락
         * @description 사장 본인 매장 주문 수락. PENDING → PREPARING. ROLE_SELLER 인증 필요.
         */
        post: operations["acceptOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/me/phone": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 사장 본인 휴대폰 변경
         * @description 본인인증 stub 을 통과한 새 휴대폰 번호로 갱신한다. phone_verified_at 도 함께 갱신.
         */
        post: operations["updatePhone"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/inquiries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 사장 내 문의 목록
         * @description 본인 문의 목록 최신순.
         */
        get: operations["list_3"];
        put?: never;
        /**
         * 사장 문의 생성
         * @description 사장 1:1 문의 접수. 생성 시 상태는 PENDING.
         */
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 본인 매장 상세 조회
         * @description 본인 소유 매장 상세 정보를 조회한다.
         */
        get: operations["detail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * 매장 정보 수정
         * @description 본인 매장의 매장명·주소·상세 주소·우편번호·전화·소개·대표 사진을 부분 수정한다 (null = 변경 X). 주소 변경 시 자체 DB 지오코딩을 재수행하고, 사진 변경 시 OCI 재업로드 + 기존 사진 best effort 삭제를 수행한다. 사업자번호·영업상태·영업시간은 수정 불가 — 요청에 포함돼도 무시.
         */
        patch: operations["update"];
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/products/{productId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 본인 매장 상품 상세 조회 */
        get: operations["detail_1"];
        put?: never;
        post?: never;
        /**
         * 일반 상품 삭제
         * @description 본인 매장 상품을 소프트 삭제한다.
         */
        delete: operations["delete"];
        options?: never;
        head?: never;
        /**
         * 일반 상품 수정
         * @description 본인 매장 상품의 이름·가격·이미지를 부분 수정한다. null 필드는 변경하지 않는다.
         */
        patch: operations["update_1"];
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/operation-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 매장 영업 상태 조회
         * @description 본인 매장의 현재 영업 상태와 오늘 영업 요일 여부 / 오늘 마감 시각을 조회한다.
         */
        get: operations["getOperationStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * 매장 영업 상태 전환
         * @description 본인 매장의 영업 상태를 OPEN / BREAK / CLOSED_TODAY 중 하나로 전환한다. 노션 전이 그래프 위반 시 409, OPEN 진입 시 오늘 휴무면 409 (STORE_CLOSED_TODAY).
         */
        patch: operations["transitionOperationStatus"];
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/clearance-items/{clearanceItemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 본인 매장 마감 임박 상품 상세 조회 */
        get: operations["detail_2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * 마감 임박 상품 수정
         * @description OPEN 상태인 떨이의 판매가·수량·픽업창을 부분 수정한다. null 필드는 변경 없음.
         */
        patch: operations["update_2"];
        trace?: never;
    };
    "/api/v1/seller/notifications/{id}/read": {
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
        /** 사장 알림 단건 읽음 처리 */
        patch: operations["markRead"];
        trace?: never;
    };
    "/api/v1/seller/notifications/read-all": {
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
        /** 사장 알림 전체 읽음 처리 */
        patch: operations["markAllRead"];
        trace?: never;
    };
    "/api/v1/seller/notification-settings/{key}": {
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
         * 사장 알림 설정 개별 변경
         * @description key: newOrder, orderCancel, refundRequest, newReview, notice, marketing
         */
        patch: operations["updateSetting"];
        trace?: never;
    };
    "/api/v1/seller/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 사장 본인 프로필 조회
         * @description JWT 의 sellerId 에 해당하는 사장의 프로필을 반환한다.
         */
        get: operations["getProfile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * 사장 본인 이름 수정
         * @description JWT 의 sellerId 에 해당하는 사장의 ownerName 을 갱신한다.
         */
        patch: operations["updateProfile"];
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/settlements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 정산 회차 목록
         * @description 사장 본인 매장의 정산 회차 목록. 최신순(year·month·half desc). ROLE_SELLER 인증 필요.
         */
        get: operations["listSettlements"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/settlements/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 정산 요약 카드
         * @description 가장 최근 SCHEDULED 정산 회차 요약. 없으면 204 No Content. ROLE_SELLER 인증 필요.
         */
        get: operations["getSettlementSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/refunds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 매장 환불 목록
         * @description 사장 본인 매장의 환불 요청 목록을 최신순으로 반환한다. ROLE_SELLER 인증 필요.
         */
        get: operations["listStoreRefunds"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 매장 주문 목록
         * @description 사장 본인 매장의 주문 목록. segment=ALL(기본)/PENDING/PREPARING/READY/COMPLETED/CANCELLED. ROLE_SELLER 인증 필요.
         */
        get: operations["listStoreOrders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/stores/{storeId}/analytics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 사장 통계 대시보드
         * @description 기간별 매출·주문·떨이·리뷰 집계. ROLE_SELLER 인증 필요.
         */
        get: operations["getAnalytics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/orders/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 사장 주문 상세
         * @description 사장 본인 매장 주문 단건 조회. 타인 매장 주문 접근 시 403. ROLE_SELLER 인증 필요.
         */
        get: operations["getStoreOrder"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 사장 알림 목록 조회 */
        get: operations["list_4"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/notifications/unread-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 사장 미읽음 알림 수 조회 */
        get: operations["unreadCount"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/notification-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 사장 알림 설정 조회 */
        get: operations["getSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seller/inquiries/{inquiryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 사장 내 문의 상세
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
    "/api/v1/seller/faqs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 사장 FAQ 목록
         * @description 사장 대상 FAQ 목록. sortOrder 오름차순.
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
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description 영업시간 1행 (영업 요일만) */
        BusinessHourPayload: {
            /**
             * @description 요일
             * @example MONDAY
             * @enum {string}
             */
            day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
            /**
             * @description 시작 시각 (24시간, 분 단위)
             * @example 09:00
             */
            openTime: string;
            /**
             * @description 종료 시각 (24시간, 분 단위, 시작 시각 이후)
             * @example 21:00
             */
            closeTime: string;
        };
        /** @description 매장 영업시간 저장 요청 (전체 교체, 영업 요일만) */
        BusinessHoursSaveRequest: {
            /** @description 영업시간 목록 (영업 요일만, 빈 list 허용) */
            hours: components["schemas"]["BusinessHourPayload"][];
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
        /** @description 매장 등록 응답 */
        StoreRegisterResponse: {
            /**
             * Format: int64
             * @description 생성된 매장 ID
             * @example 1
             */
            storeId?: number;
            /**
             * @description 초기 영업 상태 (등록 직후 CLOSED_TODAY)
             * @example CLOSED_TODAY
             * @enum {string}
             */
            operationStatus?: "OPEN" | "BREAK" | "CLOSED_TODAY";
        };
        /** @description 일반 상품 등록 요청 */
        ProductCreateRequest: {
            /**
             * @description 상품명
             * @example 크로아상
             */
            name?: string;
            /**
             * @description 정상가 (원, 정수)
             * @example 4500
             */
            regularPrice: number;
            /**
             * @description 카테고리 (BAKERY/BEVERAGE/DESSERT/ETC)
             * @example BAKERY
             * @enum {string}
             */
            category: "BAKERY" | "BEVERAGE" | "DESSERT" | "ETC";
            /** @description 상품 설명 (선택, 최대 500자) */
            description?: string;
            /**
             * @description 판매 상태 (null 이면 ON_SALE)
             * @example ON_SALE
             * @enum {string}
             */
            status?: "ON_SALE" | "SOLD_OUT";
        };
        /** @description 일반 상품 응답 */
        ProductResponse: {
            /**
             * Format: int64
             * @description 상품 ID
             * @example 1
             */
            id?: number;
            /**
             * @description 상품명
             * @example 크로아상
             */
            name?: string;
            /**
             * @description 정상가 (원)
             * @example 4500
             */
            regularPrice?: number;
            /** @description 대표 사진 URL */
            imageUrl?: string;
            /**
             * @description 상품 상태
             * @enum {string}
             */
            status?: "ON_SALE" | "SOLD_OUT";
            /**
             * @description 카테고리
             * @enum {string}
             */
            category?: "BAKERY" | "BEVERAGE" | "DESSERT" | "ETC";
            /** @description 상품 설명 (없으면 null) */
            description?: string;
            /**
             * Format: date-time
             * @description 등록 시각
             */
            createdAt?: string;
        };
        /** @description 마감 임박 상품 등록 요청 */
        ClearanceItemCreateRequest: {
            /**
             * Format: int64
             * @description 원본 일반 상품 ID
             * @example 1
             */
            productId: number;
            /**
             * @description 판매가 (원, 정수)
             * @example 3000
             */
            salePrice: number;
            /**
             * Format: int32
             * @description 등록 수량
             * @example 5
             */
            totalQuantity: number;
            /**
             * Format: date-time
             * @description 픽업 종료 시각 (KST). 등록 당일만 허용
             * @example 2026-05-20T21:00:00
             */
            pickupEndAt: string;
        };
        /** @description 마감 임박 상품 응답 */
        ClearanceItemResponse: {
            /**
             * Format: int64
             * @description 마감 임박 상품 ID
             * @example 1
             */
            id?: number;
            /**
             * Format: int64
             * @description 원본 상품 ID
             * @example 5
             */
            productId?: number;
            /** @description 상품 대표 이미지 URL (원본 상품 기준) */
            imageUrl?: string;
            /**
             * @description 상품명 (등록 시점 스냅샷)
             * @example 크로아상
             */
            name?: string;
            /**
             * @description 정상가 (원, 등록 시점 스냅샷)
             * @example 4500
             */
            regularPrice?: number;
            /**
             * @description 판매가 (원)
             * @example 3000
             */
            salePrice?: number;
            /**
             * @description 할인율 (0~1 사이 소수, 소수점 2자리)
             * @example 0.33
             */
            discountRate?: number;
            /**
             * Format: int32
             * @description 등록 수량
             * @example 5
             */
            totalQuantity?: number;
            /**
             * Format: int32
             * @description 잔여 수량
             * @example 3
             */
            remainingQuantity?: number;
            /**
             * Format: date-time
             * @description 픽업 시작 시각
             */
            pickupStartAt?: string;
            /**
             * Format: date-time
             * @description 픽업 종료 시각
             */
            pickupEndAt?: string;
            /**
             * @description 상품 상태
             * @enum {string}
             */
            status?: "OPEN" | "SOLD_OUT" | "CLOSED";
            /**
             * @description 마감 사유 (OPEN 상태이면 null)
             * @enum {string}
             */
            closeReason?: "EXPIRED" | "SOLD_OUT" | "MANUAL";
            /**
             * Format: date-time
             * @description 등록 시각
             */
            createdAt?: string;
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
        ReviewReplyRequest: {
            content?: string;
        };
        /** @description 리뷰에 포함된 주문 떨이 상품 */
        ReviewedProduct: {
            /**
             * Format: int64
             * @description 떨이 상품 ID
             */
            productId?: number;
            /**
             * @description 상품 종류 (항상 'deal')
             * @example deal
             */
            kind?: string;
            /** @description 상품명 */
            name?: string;
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
        /** @description 환불 거부 */
        RefundRejectRequest: {
            /**
             * @description 거부 사유 (1~200자)
             * @example 픽업 완료 후 24시간이 경과했습니다
             */
            rejectReason?: string;
        };
        /** @description 환불 주문 항목 */
        RefundItemResponse: {
            /**
             * @description 상품명
             * @example 크로아상
             */
            name?: string;
            /**
             * Format: int32
             * @description 수량
             * @example 2
             */
            quantity?: number;
            /**
             * @description 결제 단가
             * @example 3000
             */
            price?: number;
        };
        /** @description 환불 요청 (사장 뷰) */
        RefundResponse: {
            /**
             * Format: int64
             * @description 환불 ID
             * @example 1
             */
            id?: number;
            /**
             * Format: int64
             * @description 주문 ID
             * @example 42
             */
            orderId?: number;
            /**
             * @description 표시용 주문 번호
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
             * @description 고객 닉네임
             * @example 테스터
             */
            customerName?: string;
            /** @description 환불 주문 항목 목록 */
            items?: components["schemas"]["RefundItemResponse"][];
            /**
             * @description 주문 결제액
             * @example 6000
             */
            amount?: number;
            /**
             * Format: date-time
             * @description 수령완료 시각 (KST ISO 8601, nullable)
             */
            pickupCompletedAt?: string;
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
        /** @description 사장 주문 응답 */
        SellerOrderResponse: {
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
             * @description 고객 이름
             * @example 홍길동
             */
            customerName?: string;
            /**
             * @description 고객 전화번호 (nullable)
             * @example 01012345678
             */
            customerPhone?: string;
            /**
             * Format: date-time
             * @description 수락 시각 (KST ISO 8601, nullable)
             */
            acceptedAt?: string;
            /**
             * Format: date-time
             * @description 준비완료 시각 (KST ISO 8601, nullable)
             */
            readyAt?: string;
            /**
             * Format: date-time
             * @description 수령완료 시각 (KST ISO 8601, nullable)
             */
            completedAt?: string;
            /**
             * Format: date-time
             * @description 거절 시각 (KST ISO 8601, nullable)
             */
            rejectedAt?: string;
            /**
             * Format: date-time
             * @description 취소 시각 (KST ISO 8601, nullable)
             */
            cancelledAt?: string;
        };
        SellerPhoneUpdateRequest: {
            /**
             * @description 휴대폰 번호
             * @example 01012345678
             */
            phone?: string;
            /**
             * @description 본인인증 토큰 (POST /api/v1/auth/phone-verifications/confirm 에서 발급)
             * @example 550e8400-e29b-41d4-a716-446655440000
             */
            verificationToken?: string;
        };
        /** @description 사장 프로필 응답 */
        SellerProfileResponse: {
            /**
             * Format: int64
             * @description 사장 식별자
             * @example 1
             */
            id?: number;
            /**
             * @description 로그인 이메일
             * @example seller@example.com
             */
            email?: string;
            /**
             * @description 사장 이름
             * @example 홍길동
             */
            name?: string;
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
        /** @description 매장 정보 수정 요청 (부분 수정, null = 변경 X) */
        StoreUpdateRequest: {
            /**
             * @description 매장명 (변경 시)
             * @example 동네빵집
             */
            name?: string;
            /**
             * @description 도로명 주소 (변경 시 — 지오코딩 재호출 트리거)
             * @example 서울 강남구 테헤란로 427
             */
            roadAddress?: string;
            /**
             * @description 지번 주소 (선택, 주소 변경 시 함께)
             * @example 삼성동 159-1
             */
            jibunAddress?: string;
            /**
             * @description 상세 주소 (선택)
             * @example 1층
             */
            detailAddress?: string;
            /**
             * @description 우편번호 (5자리, 주소 변경 시 함께)
             * @example 06158
             */
            zonecode?: string;
            /**
             * @description 매장 전화번호
             * @example 0212345678
             */
            phone?: string;
            /**
             * @description 매장 소개
             * @example 매일 아침 직접 굽는 신선한 빵
             */
            description?: string;
            /**
             * @description 시군구코드 (주소 변경 시, 5자리)
             * @example 11680
             */
            sigunguCode?: string;
            /**
             * @description 도로명번호 (주소 변경 시, 최대 7자리)
             * @example 3179999
             */
            roadnameCode?: string;
        };
        /** @description 사장 매장 상세 응답 */
        StoreDetailResponse: {
            /**
             * Format: int64
             * @description 매장 ID
             * @example 1
             */
            id?: number;
            /**
             * @description 사업자 번호
             * @example 1234567890
             */
            businessNumber?: string;
            /**
             * @description 매장명
             * @example 동네빵집
             */
            name?: string;
            /** @description 도로명 주소 */
            roadAddress?: string;
            /** @description 지번 주소 */
            jibunAddress?: string;
            /** @description 상세 주소 */
            detailAddress?: string;
            /** @description 우편번호 */
            zonecode?: string;
            /**
             * Format: double
             * @description 위도
             */
            latitude?: number;
            /**
             * Format: double
             * @description 경도
             */
            longitude?: number;
            /** @description 매장 전화번호 */
            phone?: string;
            /** @description 매장 소개 */
            description?: string;
            /** @description 대표 사진 URL */
            imageUrl?: string;
            /**
             * Format: date-time
             * @description 등록 시각
             */
            createdAt?: string;
        };
        /** @description 일반 상품 수정 요청 (null 필드는 변경하지 않음) */
        ProductUpdateRequest: {
            /**
             * @description 상품명
             * @example 크로아상
             */
            name?: string;
            /**
             * @description 정상가 (원, 정수)
             * @example 4500
             */
            regularPrice?: number;
            /**
             * @description 카테고리 (null 이면 변경 없음)
             * @example BAKERY
             * @enum {string}
             */
            category?: "BAKERY" | "BEVERAGE" | "DESSERT" | "ETC";
            /** @description 상품 설명 (null 이면 변경 없음, 최대 500자) */
            description?: string;
            /**
             * @description 판매 상태 (null 이면 변경 없음)
             * @example SOLD_OUT
             * @enum {string}
             */
            status?: "ON_SALE" | "SOLD_OUT";
        };
        /** @description 매장 영업 상태 전환 요청 */
        OperationStatusTransitionRequest: {
            /**
             * @description 전환할 목표 상태
             * @example OPEN
             * @enum {string}
             */
            to: "OPEN" | "BREAK" | "CLOSED_TODAY";
        };
        /** @description 매장 영업 상태 응답 (사장 화면용) */
        OperationStatusResponse: {
            /**
             * Format: int64
             * @description 매장 ID
             * @example 1
             */
            storeId?: number;
            /**
             * @description 현재 영업 상태
             * @example CLOSED_TODAY
             * @enum {string}
             */
            operationStatus?: "OPEN" | "BREAK" | "CLOSED_TODAY";
            /**
             * @description 오늘 요일이 영업 요일인지 — `OPEN` 전환 가능 조건
             * @example false
             */
            canOpenToday?: boolean;
            /**
             * @description 오늘 요일의 마감 시각 (영업 요일일 때만, HH:mm)
             * @example 21:00
             */
            todayCloseTime?: string;
        };
        /** @description 마감 임박 상품 수정 요청 (null 필드는 변경 없음) */
        ClearanceItemUpdateRequest: {
            /**
             * @description 판매가 (원, 정수). null 이면 변경 없음
             * @example 2500
             */
            salePrice?: number;
            /**
             * Format: int32
             * @description 등록 수량. null 이면 변경 없음
             * @example 3
             */
            totalQuantity?: number;
            /**
             * Format: date-time
             * @description 픽업 종료 시각 (KST). null 이면 변경 없음
             * @example 2026-05-20T21:00:00
             */
            pickupEndAt?: string;
        };
        NotificationSettingUpdateRequest: {
            enabled: boolean;
        };
        SellerNotificationSettingsResponse: {
            newOrder?: boolean;
            orderCancel?: boolean;
            refundRequest?: boolean;
            newReview?: boolean;
            notice?: boolean;
            marketing?: boolean;
        };
        SellerProfileUpdateRequest: {
            /**
             * @description 사장 이름
             * @example 홍길동
             */
            name?: string;
        };
        /** @description 사장 보유 매장 목록 응답 (매장 전환 모달용) */
        StoreResponse: {
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
            /**
             * @description 영업 상태
             * @example OPEN
             * @enum {string}
             */
            operationStatus?: "OPEN" | "BREAK" | "CLOSED_TODAY";
        };
        SettlementCycleResponse: {
            /** Format: int64 */
            id?: number;
            /** Format: int64 */
            storeId?: number;
            /** Format: int32 */
            year?: number;
            /** Format: int32 */
            month?: number;
            /** Format: int32 */
            half?: number;
            /** Format: date-time */
            periodStart?: string;
            /** Format: date-time */
            periodEnd?: string;
            /** Format: date-time */
            depositDate?: string;
            grossAmount?: number;
            feeAmount?: number;
            netAmount?: number;
            status?: string;
        };
        SettlementSummaryResponse: {
            /** Format: int64 */
            cycleId?: number;
            periodLabel?: string;
            netAmount?: number;
            /** Format: date-time */
            depositDate?: string;
            status?: string;
        };
        Pageable: {
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            size?: number;
            sort?: string[];
        };
        PageResponseProductResponse: {
            content?: components["schemas"]["ProductResponse"][];
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            size?: number;
            /** Format: int64 */
            totalCount?: number;
            /** Format: int32 */
            totalPages?: number;
            hasNext?: boolean;
            hasPrevious?: boolean;
        };
        PageResponseClearanceItemResponse: {
            content?: components["schemas"]["ClearanceItemResponse"][];
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            size?: number;
            /** Format: int64 */
            totalCount?: number;
            /** Format: int32 */
            totalPages?: number;
            hasNext?: boolean;
            hasPrevious?: boolean;
        };
        /** @description 사장 통계 대시보드 응답 */
        AnalyticsResponse: {
            /** @description 매출 지표 */
            sales?: components["schemas"]["SalesMetrics"];
            /** @description 주문 지표 */
            orders?: components["schemas"]["OrderMetrics"];
            /** @description 떨이 지표 */
            clearance?: components["schemas"]["ClearanceMetrics"];
            /** @description 리뷰 지표 */
            review?: components["schemas"]["ReviewMetrics"];
        };
        /** @description 떨이 지표 */
        ClearanceMetrics: {
            /**
             * Format: int32
             * @description 판매 수량
             */
            soldQty?: number;
            /**
             * Format: int32
             * @description 구한 수량 (soldQty와 동일)
             */
            savedQty?: number;
            /**
             * Format: int64
             * @description 절감 금액
             */
            savedAmount?: number;
            /**
             * Format: int32
             * @description 가중평균 할인율(%)
             */
            avgDiscountRate?: number;
        };
        /** @description 주문 지표 */
        OrderMetrics: {
            /**
             * Format: int32
             * @description 총 주문수 (미결제 제외)
             */
            total?: number;
            /**
             * Format: int32
             * @description 수령완료
             */
            pickedUp?: number;
            /**
             * Format: int32
             * @description 취소+거절
             */
            canceled?: number;
            /**
             * Format: int32
             * @description 미수령
             */
            noShow?: number;
        };
        /** @description 리뷰 지표 */
        ReviewMetrics: {
            /**
             * Format: double
             * @description 평균 별점 (소수 1자리)
             */
            avgRating?: number;
            /**
             * Format: int32
             * @description 신규 리뷰 수
             */
            newCount?: number;
            /**
             * Format: int32
             * @description 답글률(%)
             */
            replyRate?: number;
            /** @description 태그별 카운트 (7종 전부, count desc) */
            tags?: components["schemas"]["ReviewTagCount"][];
        };
        /** @description 리뷰 태그 카운트 */
        ReviewTagCount: {
            /** @description 태그 한글 라벨 */
            tag?: string;
            /**
             * Format: int32
             * @description 카운트
             */
            count?: number;
        };
        /** @description 매출 차트 항목 */
        SalesBar: {
            /** @description 버킷 라벨 (예: 18시, 월, 1주, 6월) */
            label?: string;
            /**
             * Format: int64
             * @description 금액
             */
            amount?: number;
        };
        /** @description 매출 지표 */
        SalesMetrics: {
            /**
             * Format: int64
             * @description 총 매출
             */
            totalSales?: number;
            /**
             * Format: int32
             * @description 전기 대비 증감률(%)
             */
            deltaPct?: number;
            /** @description 기간별 차트 버킷 */
            chart?: components["schemas"]["SalesBar"][];
            /**
             * Format: int64
             * @description 평균 객단가
             */
            avgOrderValue?: number;
            /** @description 최다 주문 시간대 (예: 18 ~ 19시) */
            peakHour?: string;
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
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getBusinessHours: {
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
                    "*/*": components["schemas"]["BusinessHourPayload"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["BusinessHourPayload"][];
                };
            };
            /** @description 권한 없음 또는 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["BusinessHourPayload"][];
                };
            };
        };
    };
    saveBusinessHours: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BusinessHoursSaveRequest"];
            };
        };
        responses: {
            /** @description 저장 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["BusinessHourPayload"][];
                };
            };
            /** @description 입력 검증 실패 / 시작>=종료 / 같은 요일 중복 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["BusinessHourPayload"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["BusinessHourPayload"][];
                };
            };
            /** @description 권한 없음 또는 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["BusinessHourPayload"][];
                };
            };
            /** @description OPEN 중 오늘 요일 영업시간 변경(시간 수정·삭제) */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["BusinessHourPayload"][];
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
                    "*/*": components["schemas"]["StoreResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreResponse"][];
                };
            };
            /** @description 권한 없음 (ROLE_SELLER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreResponse"][];
                };
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
        requestBody?: {
            content: {
                "multipart/form-data": {
                    request: components["schemas"]["StoreCreateRequest"];
                    /** Format: binary */
                    image?: string;
                };
            };
        };
        responses: {
            /** @description 등록 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreRegisterResponse"];
                };
            };
            /** @description 입력 검증 실패 / 사업자 번호 형식 오류 / 진위확인 불일치 / 정상 영업 아님 / 지오코딩 실패 / 이미지 규격 위반 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreRegisterResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreRegisterResponse"];
                };
            };
            /** @description 권한 없음 (ROLE_SELLER 아님) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreRegisterResponse"];
                };
            };
            /** @description 사업자 번호 검증 일시 실패 (재시도 안내) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreRegisterResponse"];
                };
            };
        };
    };
    list_1: {
        parameters: {
            query: {
                pageable: components["schemas"]["Pageable"];
            };
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
                    "*/*": components["schemas"]["PageResponseProductResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PageResponseProductResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PageResponseProductResponse"];
                };
            };
        };
    };
    register_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    request: components["schemas"]["ProductCreateRequest"];
                    /** Format: binary */
                    image?: string;
                };
            };
        };
        responses: {
            /** @description 등록 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 입력 검증 실패 또는 이미지 규격 위반 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 타인 매장 접근 또는 매장 미승인 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 상품명 중복 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
        };
    };
    soldOut: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
                productId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 처리 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
        };
    };
    restock: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
                productId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 처리 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
        };
    };
    list_2: {
        parameters: {
            query: {
                pageable: components["schemas"]["Pageable"];
            };
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
                    "*/*": components["schemas"]["PageResponseClearanceItemResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PageResponseClearanceItemResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PageResponseClearanceItemResponse"];
                };
            };
        };
    };
    register_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClearanceItemCreateRequest"];
            };
        };
        responses: {
            /** @description 등록 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 입력 검증 실패 또는 픽업창·가격 규칙 위반 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 타인 매장 접근 또는 매장 미승인 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 원본 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 이미 진행 중인 마감 임박 상품 존재 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
        };
    };
    close: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
                clearanceItemId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 마감 성공 또는 이미 마감됨 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 마감 임박 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
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
            /** @description 검증 통과 */
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
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 권한 없음 (ROLE_SELLER 아님) */
            403: {
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
    replyToReview: {
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
                "application/json": components["schemas"]["ReviewReplyRequest"];
            };
        };
        responses: {
            /** @description 답글 작성 성공 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreReviewResponse"];
                };
            };
            /** @description 본인 매장 리뷰 아님 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreReviewResponse"];
                };
            };
            /** @description 이미 답글 존재 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreReviewResponse"];
                };
            };
        };
    };
    rejectRefund: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                refundId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefundRejectRequest"];
            };
        };
        responses: {
            /** @description 거부 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 거부 사유 없음 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 환불 요청 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 이미 처리된 환불 요청 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
        };
    };
    approveRefund: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                refundId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 승인 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 환불 요청 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
            /** @description 이미 처리된 환불 요청 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"];
                };
            };
        };
    };
    rejectOrder: {
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
            /** @description 거절 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 허용되지 않는 상태 전이 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
        };
    };
    readyOrder: {
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
            /** @description 준비완료 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 허용되지 않는 상태 전이 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
        };
    };
    noShowOrder: {
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
            /** @description 미수령 처리 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 허용되지 않는 상태 전이 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
        };
    };
    completeOrder: {
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
            /** @description 수령완료 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 허용되지 않는 상태 전이 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
        };
    };
    acceptOrder: {
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
            /** @description 수락 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 허용되지 않는 상태 전이 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
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
                "application/json": components["schemas"]["SellerPhoneUpdateRequest"];
            };
        };
        responses: {
            /** @description 변경 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerProfileResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerProfileResponse"];
                };
            };
        };
    };
    list_3: {
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
                    "*/*": components["schemas"]["StoreDetailResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreDetailResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreDetailResponse"];
                };
            };
        };
    };
    update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    request: components["schemas"]["StoreUpdateRequest"];
                    /** Format: binary */
                    image?: string;
                };
            };
        };
        responses: {
            /** @description 수정 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreDetailResponse"];
                };
            };
            /** @description 입력 검증 실패 / 지오코딩 실패 / 이미지 규격 위반 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreDetailResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreDetailResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreDetailResponse"];
                };
            };
        };
    };
    detail_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
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
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
        };
    };
    delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
                productId: number;
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
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 진행 중인 떨이 존재 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    update_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
                productId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    request: components["schemas"]["ProductUpdateRequest"];
                    /** Format: binary */
                    image?: string;
                };
            };
        };
        responses: {
            /** @description 수정 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 입력 검증 실패 또는 이미지 규격 위반 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
            /** @description 상품명 중복 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductResponse"];
                };
            };
        };
    };
    getOperationStatus: {
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
                    "*/*": components["schemas"]["OperationStatusResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OperationStatusResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OperationStatusResponse"];
                };
            };
        };
    };
    transitionOperationStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OperationStatusTransitionRequest"];
            };
        };
        responses: {
            /** @description 전환 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OperationStatusResponse"];
                };
            };
            /** @description 입력 검증 실패 (to 누락 등) */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OperationStatusResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OperationStatusResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OperationStatusResponse"];
                };
            };
            /** @description 금지 전이 (자기 전이 / CLOSED_TODAY→BREAK) 또는 OPEN 진입 시 오늘이 영업 요일 아님 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["OperationStatusResponse"];
                };
            };
        };
    };
    detail_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
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
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 마감 임박 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
        };
    };
    update_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                storeId: number;
                clearanceItemId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClearanceItemUpdateRequest"];
            };
        };
        responses: {
            /** @description 수정 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 입력 검증 실패 또는 픽업창·가격 규칙 위반 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 타인 매장 접근 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description 마감 임박 상품 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
                };
            };
            /** @description OPEN 상태가 아님 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ClearanceItemResponse"];
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
                    "*/*": components["schemas"]["SellerNotificationSettingsResponse"];
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
                    "*/*": components["schemas"]["SellerProfileResponse"];
                };
            };
            /** @description 사장 미존재 또는 탈퇴 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerProfileResponse"];
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
                "application/json": components["schemas"]["SellerProfileUpdateRequest"];
            };
        };
        responses: {
            /** @description 수정 성공 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerProfileResponse"];
                };
            };
            /** @description 입력 검증 실패 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerProfileResponse"];
                };
            };
            /** @description 사장 미존재 또는 탈퇴 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerProfileResponse"];
                };
            };
        };
    };
    listSettlements: {
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
                    "*/*": components["schemas"]["SettlementCycleResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SettlementCycleResponse"][];
                };
            };
            /** @description 권한 없음 또는 타인 매장 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SettlementCycleResponse"][];
                };
            };
        };
    };
    getSettlementSummary: {
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
                    "*/*": components["schemas"]["SettlementSummaryResponse"];
                };
            };
            /** @description 예정 정산 없음 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SettlementSummaryResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SettlementSummaryResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SettlementSummaryResponse"];
                };
            };
        };
    };
    listStoreRefunds: {
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
                    "*/*": components["schemas"]["RefundResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"][];
                };
            };
            /** @description 권한 없음 또는 타인 매장 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RefundResponse"][];
                };
            };
        };
    };
    listStoreOrders: {
        parameters: {
            query?: {
                segment?: string;
            };
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
                    "*/*": components["schemas"]["SellerOrderResponse"][];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"][];
                };
            };
            /** @description 권한 없음 또는 타인 매장 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"][];
                };
            };
            /** @description 매장 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"][];
                };
            };
        };
    };
    getAnalytics: {
        parameters: {
            query: {
                /** @description 집계 기간 (today|week|month|year) */
                period: "TODAY" | "WEEK" | "MONTH" | "YEAR";
            };
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
                    "*/*": components["schemas"]["AnalyticsResponse"];
                };
            };
            /** @description 잘못된 기간 값 또는 파라미터 누락 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AnalyticsResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AnalyticsResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AnalyticsResponse"];
                };
            };
        };
    };
    getStoreOrder: {
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
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 권한 없음 또는 타인 매장 주문 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
                };
            };
            /** @description 주문 없음 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SellerOrderResponse"];
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
                    "*/*": components["schemas"]["SellerNotificationSettingsResponse"];
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
    list_5: {
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
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FaqResponse"][];
                };
            };
        };
    };
}
