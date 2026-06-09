import { z } from 'zod'

/** 매장 영업 상태 — `stores.operation_status` (노션: 매장 영업 상태 관리) */
export const OPERATION_STATUSES = ['OPEN', 'BREAK', 'CLOSED_TODAY'] as const
export const operationStatusSchema = z.enum(OPERATION_STATUSES)
export type OperationStatus = z.infer<typeof operationStatusSchema>

/** 요일 코드 (영업 요일 판정용) — `new Date().getDay()` 순서 */
export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
export type Weekday = (typeof WEEKDAYS)[number]
export const weekdaySchema = z.enum(WEEKDAYS)

/** 요일 표시 순서 — 월요일 선두 (영업시간 화면 행 순서). WEEKDAYS 는 getDay() 순(일선두)이라 별도 */
export const WEEKDAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

/** 요일 한글 라벨 */
export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: '월요일',
  tue: '화요일',
  wed: '수요일',
  thu: '목요일',
  fri: '금요일',
  sat: '토요일',
  sun: '일요일',
}

/** 보유 매장 요약 — 헤더 매장 선택기·전환 모달용 (영업 상태 라벨 포함) */
export interface StoreSummary {
  id: number
  name: string
  operationStatus: OperationStatus
}

/** 매장 영업 상태 — 카드/시트 렌더 소스 */
export interface StoreStatus {
  storeId: number
  operationStatus: OperationStatus
  /** 오늘 요일이 영업 요일인가 — OPEN 전환 가능 조건 (영업 요일 0개면 false) */
  canOpenToday: boolean
  /** OPEN 라벨용 오늘 마감 시각 (HH:MM). 없으면 라벨에 미표시 */
  todayCloseTime?: string
}

/** 영업 상태 관리 시트의 전환 액션 (현재 상태에서 노출되는 선택지) */
export interface StatusAction {
  /** 전환 목표 상태 (= 시트 액션 식별자) */
  to: OperationStatus
  label: string
  description: string
  icon: string
  enabled: boolean
  /** 비활성 사유 — enabled=false 일 때만 */
  disabledReason?: string
}

/** HH:MM (24시간·분 단위) */
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '시:분 형식이 올바르지 않습니다')

/**
 * 영업일 1건 — `store_business_hours` row. **영업 요일만 존재** (휴무 요일은 row 없음).
 * 조회/저장 단위 (FE↔mock, 추후 BE 연동).
 */
export interface BusinessHour {
  day: Weekday
  /** HH:MM */
  openTime: string
  /** HH:MM */
  closeTime: string
}

/**
 * 영업시간 폼 1행 — 월~일 7행 고정 렌더용. `closed=true` 면 시각은 무시(휴무).
 * 저장 시 `closed=false` 행만 모아 BusinessHour[] 로 변환.
 */
const dayHoursFormSchema = z
  .object({
    day: weekdaySchema,
    closed: z.boolean(),
    openTime: z.string(),
    closeTime: z.string(),
  })
  .refine(
    (d) =>
      d.closed ||
      (timeSchema.safeParse(d.openTime).success &&
        timeSchema.safeParse(d.closeTime).success &&
        d.openTime < d.closeTime),
    { message: '마감 시간은 오픈 시간 이후여야 해요', path: ['closeTime'] },
  )

/** 영업시간 설정 폼 — 월~일 7행 */
export const businessHoursFormSchema = z.object({
  days: z.array(dayHoursFormSchema).length(7),
})
export type BusinessHoursForm = z.infer<typeof businessHoursFormSchema>
export type DayHoursForm = BusinessHoursForm['days'][number]

/**
 * 매장 등록 신청 폼 (경로 B — 로그인 사장 추가 등록). 회원가입 Step5 매장 필드와 동일 골격.
 * 디테일·정책 → 노션 「매장 등록 신청」. 사업자번호는 진위확인(번호+대표자명+개업일자) 후 bizVerified.
 * 대표 사진은 선택(mock) — OCI 업로드/실패 거부는 BE·연동 소관.
 */
export const storeRegistrationSchema = z
  .object({
    representativeName: z.string().min(1, '대표자명을 입력해주세요'),
    businessNumber: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, '사업자등록번호를 확인해주세요'),
    openDate: z.string().min(1, '개업일자를 선택해주세요'),
    bizVerified: z.boolean(),
    storeName: z.string().min(1, '매장명을 입력해주세요'),
    storeAddress: z.string().min(1, '매장 주소를 등록해주세요'),
    storeAddressDetail: z.string().optional(),
    storePhone: z.string().min(1, '매장 전화번호를 입력해주세요'),
    photoAdded: z.boolean().optional(),
  })
  .refine((d) => d.bizVerified, {
    message: '사업자등록번호 조회를 완료해주세요',
    path: ['bizVerified'],
  })
export type StoreRegistrationInput = z.infer<typeof storeRegistrationSchema>

/** createStore API payload — FE 전용 게이트 플래그(bizVerified) 제외 */
export type CreateStoreInput = Omit<StoreRegistrationInput, 'bizVerified'>

/**
 * 매장 정보 수정 폼 (노션 「매장 정보 수정」) — 수정 가능 5필드:
 * 매장명·주소·상세 주소·전화번호·대표 사진. 사업자번호·대표자명·영업상태·영업시간은 비범위(불변/별도 화면).
 * 등록 폼에서 사업자 진위확인(대표자명·번호·개업일자) 블록만 뺀 부분집합.
 */
export const storeEditSchema = z.object({
  storeName: z.string().min(1, '매장명을 입력해주세요'),
  storeAddress: z.string().min(1, '매장 주소를 등록해주세요'),
  storeAddressDetail: z.string().optional(),
  storePhone: z.string().min(1, '매장 전화번호를 입력해주세요'),
  photoAdded: z.boolean().optional(),
})
export type StoreEditInput = z.infer<typeof storeEditSchema>

/** updateStore API payload — 대상 매장 id + 수정 필드 */
export type UpdateStoreInput = StoreEditInput & { storeId: number }

/** 매장 상세 — 수정 폼 미리채움 소스 (getStore 응답). 수정 가능 필드 + id */
export interface StoreDetail {
  id: number
  storeName: string
  storeAddress: string
  storeAddressDetail?: string
  storePhone: string
  photoAdded: boolean
}
