import { describe, it, expect } from 'vitest'
import {
  inquiryCategoryLabel,
  INQUIRY_STATUS_LABEL,
  INQUIRY_CATEGORY_OPTIONS,
} from './inquiryFormat'

describe('inquiryCategoryLabel (관대 파싱)', () => {
  it('9종 매핑을 한글 라벨로 변환', () => {
    expect(inquiryCategoryLabel('payment')).toBe('결제')
    expect(inquiryCategoryLabel('settlement')).toBe('정산')
    expect(inquiryCategoryLabel('etc')).toBe('기타')
  })

  it('매핑에 없는 미지 값은 원문을 그대로 표시', () => {
    expect(inquiryCategoryLabel('mystery')).toBe('mystery')
  })

  it('빈 값/공백은 "기타" 로 fallback', () => {
    expect(inquiryCategoryLabel('')).toBe('기타')
    expect(inquiryCategoryLabel('   ')).toBe('기타')
  })
})

describe('상태 라벨 / 카테고리 옵션', () => {
  it('상태 라벨', () => {
    expect(INQUIRY_STATUS_LABEL.pending).toBe('답변 대기')
    expect(INQUIRY_STATUS_LABEL.answered).toBe('답변 완료')
  })

  it('필터 카테고리 옵션은 9종 고정', () => {
    expect(INQUIRY_CATEGORY_OPTIONS).toHaveLength(9)
    expect(INQUIRY_CATEGORY_OPTIONS[0]).toEqual({ value: 'payment', label: '결제' })
  })
})
