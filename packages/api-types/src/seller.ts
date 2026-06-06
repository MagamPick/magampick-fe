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
             * @description 픽업 시작 시각 (KST)
             * @example 2026-05-20T17:00:00
             */
            pickupStartAt: string;
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
             * @description 휴대폰 번호. 가입 직후엔 null 가능
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
             * @description 픽업 시작 시각 (KST). null 이면 변경 없음
             * @example 2026-05-20T17:00:00
             */
            pickupStartAt?: string;
            /**
             * Format: date-time
             * @description 픽업 종료 시각 (KST). null 이면 변경 없음
             * @example 2026-05-20T21:00:00
             */
            pickupEndAt?: string;
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
}
