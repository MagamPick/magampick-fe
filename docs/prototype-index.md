# 프로토타입 인덱스

`../prototype/` (레포 밖, git 무관) 의 화면·스타일·데이터를 빠르게 찾기 위한 **지도**.
매번 2,000줄짜리 `index.html` 전체를 읽지 말고, 이 표에서 라인 범위·파일을 찾아 **필요한 부분만** 읽는다.

---

## 위치 / 접근

- **원본**: `../prototype/` — 프론트 레포 **밖**, git 추적 안 함 (모든 fe 디렉터리의 형제)
- **접근**: `.claude/settings.json` 의 `permissions.additionalDirectories: ["../prototype"]` → 메인·슬롯(`magampick-fe`, `-wt1/2/3`) 전부 프롬프트 없이 read (상대경로가 각 디렉터리 기준으로 풀려 동일하게 `magampick/prototype` 지목)
- **두 앱**:
  | 프로토타입 폴더 | 대응 앱 |
  |---|---|
  | `consumer-v3-split/` (소비자) | `apps/customer` |
  | `owner-v3/` (사장) | `apps/seller` |
  | (없음) | `apps/admin` — 프로토타입 없음, 별도 설계 |

> 프로토타입은 **UI 마크업·스타일의 참조 소스**. 동작 로직(바닐라 JS)은 React + TanStack Query + 노션 명세로 새로 짜므로 직접 베끼지 않는다. 구현 중 발견하는 "이상한 것"(UI/CSS/네비게이션)은 고치면서 진행 — 거의 맞지만 조금씩 어긋난 부분이 있음.

---

## 폴더 구조 (두 앱 공통)

```
consumer-v3-split/  (owner-v3/)
├── index.html      # 모든 화면 HTML 인라인 — <!-- ==== XX-name ==== --> 주석으로 섹션 구분
├── styles/         # 관심사별 CSS (01-tokens = 디자인 토큰)
└── scripts/        # 기능별 번호 JS (01-data = 데이터 모델, 99-app = 부팅)
```

- **HTML 화면 찾기**: `index.html` 에서 `Ctrl+F` 로 `<!-- ==== 31-product-detail ==== -->` 같은 섹션 마커 검색 (아래 표에 라인 범위 정리)
- **CSS·JS 파일 매핑**: 각 앱 `README.md` 의 styles/scripts 매핑 표 참조 (HTML 섹션 번호와 JS 파일 번호가 일부 어긋나니 README 기준)
- **데이터 모델**: `scripts/01-data.js` (목업 — 백엔드 연동 시 교체)

---

## 디자인 토큰 (소비자 `styles/01-tokens.css` 가 마스터)

owner 토큰은 "소비자와 동일" 명시 (색 100% 일치). PR② 에서 `tailwind.config.shared.ts` 로 추출 예정.

| 그룹 | 토큰 |
|---|---|
| **색 — 주조** | primary `#FF6B35` · primary-dark `#E85427` · primary-light `#FFF0EB` |
| **색 — 크림** | cream `#FBF1E0` · cream-deep `#F3E2C7` |
| **색 — 면** | surface `#FFFFFF` · background `#F7F7F7` · border `#E5E5E5` |
| **색 — 텍스트** | primary `#1A1A1A` · secondary `#767676` · disabled `#BDBDBD` |
| **색 — 상태** | success `#28A745` · warning `#FFC107` · error/danger `#DC3545` · info `#0D6EFD` |
| **spacing** | 1=4 · 2=8 · 3=12 · 4=16 · 5=20 · 6=24 · 8=32 · 12=48 (px) |
| **radius** | button 12 · card 16 · input 10 · pill 999 · hero 28 · thumb 14 |
| **shadow** | 1/2/3 (elevation) + hero (오렌지 글로우) |
| **gradient** | hero · hero-soft · bread |
| **typography** | display 22 · h2 18 · h3 16 · body 14 · meta 12.5 · caption 11.5 / fw 800·700·600 / ls-tight -0.4 |
| **layout** | page-padding-x 20 · statusbar-h 54 · header-h 52 · home-indicator-clear 24 |
| **폰트** | **Pretendard** (CDN @import) |

---

## 프로토타입 용어 ↔ 백엔드 도메인 (⚠️ 헷갈림 주의)

프로토타입의 "상품" 워딩이 백엔드 도메인과 엇갈린다:

| 프로토타입 데이터 | 의미 | 백엔드 도메인 |
|---|---|---|
| 소비자 `PRODUCTS` / 사장 `DEALS` | **마감 할인** 상품 (정가·할인가·마감시각·수량) | **`clearance`** (ClearanceItem) |
| 소비자 `STORE_MENUS` / 사장 `PRODUCTS` | **일반 메뉴/상품** (정가만) | **`product`** |
| `STORES` | 매장 | `store` |
| `FAVORITES` | 단골 매장 | `favorite` |
| `ADDRESSES` | 배송/픽업 주소 | `address` |
| 로그인·회원가입·비번찾기 | 인증 | `auth` |
| `USER_PROFILE`(소비자) / `MY_STORE`·계정(사장) | 계정 | `customer` / `seller` |

---

## 소비자 화면 인덱스 (`apps/customer` · `consumer-v3-split/index.html`)

라인 = `index.html` 섹션 마커 기준. CSS/JS 는 README 매핑 참조.

| 섹션 마커 | 화면 | HTML 라인 | feature 후보 |
|---|---|---|---|
| `99-addr-sheet` | 주소검색 시트(회원가입용) | 89–106 | addresses |
| `99-location-sheet` | 위치선택 시트(홈/마이용) | 107–149 | addresses |
| `10-login` | 로그인 | 150–196 | auth |
| `11-forgot` | 비밀번호 찾기 (3-state) | 197–277 | auth |
| `12-signup` | 회원가입 (5-step: 약관·계정·휴대폰·주소·프로필) | 278–460 | auth |
| `13-welcome` | 가입 완료 | 461–481 | auth |
| `20-home` | 홈 | 482–638 | stores + clearance |
| `21-map` | 지도 | 639–680 | stores |
| `22-all` | 전체 가게 | 681–706 | stores |
| `23-favs` | 단골 | 707–722 | favorites |
| `24-orders` | 주문 | 723–830 | orders ⚠️미구현 |
| `25-mypage` | 마이 | 831–947 | customer |
| `30-store-detail` | 매장 상세 (메뉴 탭 포함) | 948–1068 | stores + product |
| `31-product-detail` | 상품(마감할인) 상세 | 1069–1113 | clearance |
| `40-cart` | 장바구니 | 1114–1161 | orders ⚠️미구현 |
| `41-checkout` | 결제 | 1162–1268 | orders ⚠️미구현 |
| `42-order-success` | 결제 완료 | 1269–1304 | orders ⚠️미구현 |
| `50-order-detail` | 주문 상세 (픽업 코드) | 1305–1422 | orders ⚠️미구현 |
| `51-notifications` | 알림센터 | 1423–1447 | notifications ⚠️미구현 |
| `52-review-write` | 리뷰 작성 | 1448–1520 | reviews ⚠️미구현 |
| `53-search` | 검색 | 1521–1592 | stores |
| `55-point-history` | 포인트 내역 | 1593–1619 | points ⚠️미구현 |
| `56-coupons` | 쿠폰함 | 1620–1642 | coupons ⚠️미구현 |
| `57-events` | 이벤트(쿠폰 받기) | 1643–1666 | coupons ⚠️미구현 |
| `58-store-map` | 매장 지도 | 1667–1707 | stores |
| `59-edit-profile` | 프로필 수정 | 1708–1747 | customer |
| `99-edit-profile-sheets` | 프로필 필드 편집 시트들 | 1748–1929 | customer |
| `60-addresses` | 주소 관리 | 1930–1966 | addresses |
| `64-addr-edit` | 주소 추가/수정 | 1967–2029 | addresses |
| `61-notif-settings` | 알림 설정 | 2030–2043 | notifications ⚠️미구현 |
| `62-my-reviews` | 내가 쓴 리뷰 | 2044–2064 | reviews ⚠️미구현 |
| `63-support` | 고객지원 (FAQ·1:1문의) | 2065–2106 | support ⚠️미구현 |
| `66-announcements` | 공지사항 | 2107–2123 | support ⚠️미구현 |
| `90-bottom-nav` | 바텀 네비게이션 | 2124–2193 | shared/layout |

**소비자 데이터 모델** (`scripts/01-data.js`): `STORES`(매장) · `STORE_MENUS`(일반메뉴) · `PRODUCTS`(마감할인) · `FAVORITES`(단골 Set) · `POINTS`(잔액+내역) · `COUPONS` · `EVENTS` · `USER_PROFILE` · `ADDRESSES` · `NOTIF_SETTINGS`(토글 5종) · `MY_REVIEWS`(평점·태그·사진·사장답글) · `FAQS` · `SUPPORT_CATEGORIES` · `ANNOUNCEMENTS`

---

## 사장 화면 인덱스 (`apps/seller` · `owner-v3/index.html`)

| 섹션 마커 | 화면 | HTML 라인 | feature 후보 |
|---|---|---|---|
| `00-toolbar` / `01-device-open` | 개발용 툴바 · 디바이스 프레임 | 18–87 | (참조 무시) |
| `10-login` | 로그인 | 88–132 | auth |
| `11-forgot` | 비밀번호 찾기 (3-state) | 133–213 | auth |
| `12-signup` | 회원가입 (5-step: 약관·계정·본인인증·대표자·매장) | 214–460 | auth + seller |
| `20-home` | 홈 (대시보드) | 461–602 | stores + clearance |
| `21-orders` | 주문 | 603–782 | orders ⚠️미구현 |
| `22-products` | 상품 (일반) | 783–824 | product |
| `23-analytics` | 통계 | 825–860 | analytics ⚠️미구현 |
| `24-mypage` | 마이 | 861–958 | seller |
| `30-order-detail` | 주문 상세 + 거절 시트 | 959–1027 | orders ⚠️미구현 |
| `31-deal-create` | 마감 할인 등록 (4-step) | 1028–1131 | clearance |
| `32-deal-detail` | 마감 할인 상세·수정 + 조기마감 시트 | 1132–1206 | clearance |
| `33-product-create` | 일반 상품 등록 | 1207–1280 | product |
| `40-store-manage` | 매장 관리 | 1281–1346 | store |
| `41-store-hours` | 영업시간 + 임시휴업 시트 | 1347–1409 | store |
| `42-settlement` | 정산 내역 | 1410–1487 | settlement ⚠️미구현 |
| `50-reviews` | 리뷰 관리 + 답글 시트 | 1488–1572 | reviews ⚠️미구현 |
| `51-notifications` | 알림센터 | 1573–1642 | notifications ⚠️미구현 |
| `52-settings` | 설정 | 1643–1712 | seller |
| `60-terms` | 약관 및 정책 | 1713–1733 | support ⚠️미구현 |
| `61-notices` | 공지사항 목록 | 1734–1747 | support ⚠️미구현 |
| `62-notice-detail` | 공지사항 상세 | 1748–1764 | support ⚠️미구현 |
| `53-profile-edit` | 프로필 수정 + 휴대폰 OTP 시트 | 1765–1809 | seller |
| `54-password-change` | 비밀번호 변경 | 1810–1852 | auth |
| `55-store-edit` | 매장 정보 수정 | 1853–1906 | store |
| `45-store-new` | 매장 추가 (사업자 인증 + 정보 + 서류) | 1907–2251 | store |
| `34-product-detail` | 상품 상세 + 삭제 시트 | 2252–2307 | product |
| `90-bottom-nav` | 바텀 네비게이션 | 2308–2327 | shared/layout |
| `99-storesheet` | 매장 전환 · 로그아웃 · 회원 탈퇴 시트 | 2328–2381 | store + auth |

**사장 데이터 모델** (`scripts/01-data.js`): `MY_STORE`·`STORES`(보유 매장) · `TERMS`(약관) · `NOTICES` · `ORDERS`(상태머신 `new→prep→ready→done`/`cancel`, 픽업코드) · `DEALS`(마감할인 `live/soon/ended`) · `PRODUCTS`(일반상품) · `STORE_HOURS`(요일별) · `ANALYTICS_DATA`(today/week/month — 매출·주문·폐기절감·리뷰)

---

## 백엔드 도메인 현황 (`magampick-api`)

`/impl` 시 feature 폴더명은 노션 명세 + 아래 백엔드 도메인명에 맞춰 확정 (위 표의 "feature 후보" 는 참고용).

- **구현됨** (컨트롤러 존재): `auth` · `customer` · `seller` · `address` · `store` · `product` · `clearance` · `favorite`
- **미구현** (프로토타입엔 있으나 백엔드 없음 — 표에 ⚠️): `order`(주문·장바구니·결제·픽업) · `review` · `point` · `coupon`/`event` · `notification` · `settlement` · `analytics` · `support`(FAQ·공지·약관)

---

## 변경 이력
- 2026-05-30: 초안 작성 (소비자 ~24화면 + 사장 ~25화면 라인맵, 디자인 토큰, 용어/도메인 매핑).
