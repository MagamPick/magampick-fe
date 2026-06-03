import { sortNotices } from '../lib/sortNotices'
import { noticeSchema, type Notice } from '../types'

/**
 * ⚠️ Mock 스텁 — support BE 미구현. in-memory 공지 목록 (couponApi 패턴: 배열 + delay + Zod).
 * 작성·발행은 관리자(별도 기능). 본 기능은 발행된 공지 조회만. 정렬은 listNotices 에서 sortNotices 적용.
 * 시드 = 소비자 프로토타입 `ANNOUNCEMENTS` 6건(태그 공지/이벤트/업데이트).
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const NOTICES: Notice[] = [
  {
    id: 'an1',
    tag: 'update',
    pinned: true,
    date: '2026-05-26',
    title: '5월 정기 업데이트 — 결제 페이지 쿠폰·포인트 적용',
    body: '결제 페이지에서 보유한 쿠폰과 포인트를 한 번에 사용할 수 있도록 개선했어요. 마이 → 쿠폰함·포인트에서 잔액을 먼저 확인해보세요.',
  },
  {
    id: 'an2',
    tag: 'event',
    pinned: true,
    date: '2026-05-22',
    title: '신규 가입 30% 쿠폰 이벤트 진행 중',
    body: '회원가입 후 마이 → 이벤트에서 쿠폰을 받을 수 있어요. 첫 주문 결제 5,000원 이상부터 사용 가능합니다.',
  },
  {
    id: 'an3',
    tag: 'notice',
    pinned: false,
    date: '2026-05-18',
    title: '서비스 점검 안내 (5월 21일 02:00 ~ 04:00)',
    body: '서버 정기 점검으로 해당 시간 동안 결제·주문 기능이 제한될 수 있어요. 미리 양해 부탁드립니다.',
  },
  {
    id: 'an4',
    tag: 'update',
    pinned: false,
    date: '2026-05-12',
    title: '주소 관리 화면이 새롭게 바뀌었어요',
    body: '홈 헤더의 위치 또는 마이 → 주소 관리에서 여러 개의 주소를 저장하고 ✎ 버튼으로 별칭·상세주소를 편집할 수 있어요.',
  },
  {
    id: 'an5',
    tag: 'notice',
    pinned: false,
    date: '2026-05-05',
    title: '카카오 로그인이 추가되었어요',
    body: '카카오 계정으로 빠르게 가입할 수 있어요. 일반 회원가입과 달리 4단계만 거치면 완료됩니다.',
  },
  {
    id: 'an6',
    tag: 'event',
    pinned: false,
    date: '2026-04-28',
    title: '단골 매장 마감 할인 알림 켜기',
    body: '마이 → 알림 설정에서 단골 매장의 새 마감 할인 알림을 켜두면 우선 안내해드려요.',
  },
].map((notice) => noticeSchema.parse(notice))

export const noticeApi = {
  /** 발행된 공지 — 핀 우선·최신순 정렬해 반환 */
  async listNotices(): Promise<Notice[]> {
    await delay(250)
    return sortNotices(NOTICES)
  },
}
