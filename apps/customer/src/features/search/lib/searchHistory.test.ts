import { describe, it, expect, beforeEach } from 'vitest'
import {
  addEntry,
  readHistory,
  writeHistory,
  searchHistoryKey,
  SEARCH_HISTORY_MAX,
} from './searchHistory'

describe('searchHistory', () => {
  describe('addEntry (순수)', () => {
    it('새_검색어는_맨_앞에_추가', () => {
      expect(addEntry(['b', 'c'], 'a')).toEqual(['a', 'b', 'c'])
    })

    it('중복_검색어는_제거후_맨앞으로_갱신', () => {
      expect(addEntry(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b'])
    })

    it('최대_N개_초과시_가장_오래된것_제거', () => {
      const full = Array.from({ length: SEARCH_HISTORY_MAX }, (_, i) => `q${i}`)
      const result = addEntry(full, 'new')
      expect(result).toHaveLength(SEARCH_HISTORY_MAX)
      expect(result[0]).toBe('new')
      // 가장 오래된 q9 가 밀려난다
      expect(result).not.toContain(`q${SEARCH_HISTORY_MAX - 1}`)
    })

    it('공백만_있는_검색어는_무시', () => {
      expect(addEntry(['a'], '   ')).toEqual(['a'])
    })

    it('앞뒤_공백은_trim', () => {
      expect(addEntry([], '  김밥  ')).toEqual(['김밥'])
    })
  })

  describe('계정별 localStorage', () => {
    beforeEach(() => localStorage.clear())

    it('계정별로_분리되어_안_섞인다', () => {
      writeHistory(1, ['크루아상'])
      writeHistory(2, ['라떼'])
      expect(readHistory(1)).toEqual(['크루아상'])
      expect(readHistory(2)).toEqual(['라떼'])
    })

    it('기록_없으면_빈_배열', () => {
      expect(readHistory(99)).toEqual([])
    })

    it('손상된_값이면_빈_배열', () => {
      localStorage.setItem(searchHistoryKey(1), 'not-json{')
      expect(readHistory(1)).toEqual([])
    })

    it('비로그인은_guest_키', () => {
      expect(searchHistoryKey(null)).toBe('magampick-search-history:guest')
    })
  })
})
