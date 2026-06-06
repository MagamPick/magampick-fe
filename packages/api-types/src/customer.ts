/**
 * AUTO-GENERATED — 직접 수정 금지.
 * SpringDoc OpenAPI group: 1. Public (소비자)
 * 재생성: pnpm --filter @magampick/api-types gen
 */

export interface paths {
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
    "/api/v1/customers/me/favorites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 즐겨찾기 목록 조회 */
        get: operations["list"];
        put?: never;
        /** 즐겨찾기 등록 */
        post: operations["add"];
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
        get: operations["list_1"];
        put?: never;
        /**
         * 주소지 등록
         * @description 본인 주소지를 등록한다. 최대 3개까지 보유 가능. 첫 등록 시 자동으로 기본 주소지로 지정된다.
         */
        post: operations["create"];
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
         * @description 사장 계정을 생성하고 자동 로그인한다. refresh 는 HttpOnly 쿠키로 발급.
         */
        post: operations["signupSeller"];
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
         * @description 본인 주소지를 삭제한다. 기본 주소지를 삭제한 경우, 남은 주소 중 가장 오래된 것이 자동으로 기본 주소지로 승계된다.
         */
        delete: operations["delete"];
        options?: never;
        head?: never;
        /**
         * 주소지 수정
         * @description 본인 주소지의 라벨/주소/좌표를 부분 수정한다. 기본 주소지 변경은 별도 endpoint 사용.
         */
        patch: operations["update"];
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
        CustomerPhoneUpdateRequest: {
            /**
             * @description 휴대폰 번호 (010 prefix, 숫자 11자리)
             * @example 01012345678
             */
            phone?: string;
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
             * Format: double
             * @description 위도
             * @example 37.5066
             */
            latitude: number;
            /**
             * Format: double
             * @description 경도
             * @example 127.0535
             */
            longitude: number;
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
             * @description 사장 이름
             * @example 홍길동
             */
            ownerName?: string;
            /**
             * @description 사업자번호(숫자 10자리)
             * @example 1234567890
             */
            businessNumber?: string;
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
        CustomerProfileUpdateRequest: {
            /**
             * @description 닉네임
             * @example 마감픽유저
             */
            nickname?: string;
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
            /**
             * Format: double
             * @description 위도. longitude 와 쌍으로 함께 전송
             */
            latitude?: number;
            /**
             * Format: double
             * @description 경도. latitude 와 쌍으로 함께 전송
             */
            longitude?: number;
            coordinatePairValid?: boolean;
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
            type?: "TERMS_OF_SERVICE" | "PRIVACY" | "LOCATION" | "AGE_14" | "MARKETING";
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
        Pageable: {
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            size?: number;
            sort?: string[];
        };
        /** @description 즐겨찾기 목록 아이템 */
        FavoriteStoreResponse: {
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
             * @description 도로명 주소
             * @example 서울시 강남구 테헤란로 1
             */
            roadAddress?: string;
            /** @description 매장 이미지 URL */
            imageUrl?: string;
            /**
             * Format: date-time
             * @description 즐겨찾기 등록 시각
             */
            createdAt?: string;
        };
        PageResponseFavoriteStoreResponse: {
            content?: components["schemas"]["FavoriteStoreResponse"][];
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
            query: {
                pageable: components["schemas"]["Pageable"];
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
                    "*/*": components["schemas"]["PageResponseFavoriteStoreResponse"];
                };
            };
            /** @description 미인증 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PageResponseFavoriteStoreResponse"];
                };
            };
            /** @description 권한 없음 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PageResponseFavoriteStoreResponse"];
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
    create: {
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
            /** @description 검증 실패 또는 보유 한도 초과 */
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
    signupSeller: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SellerSignupRequest"];
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
    getTerms: {
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
                    "*/*": components["schemas"]["TermResponse"][];
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
