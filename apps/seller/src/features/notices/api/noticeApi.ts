import { sortNotices } from '../lib/sortNotices'
import { noticeSchema, type Notice } from '../types'

/**
 * ⚠️ Mock 스텁 — support BE 미구현. in-memory 공지 목록 (couponApi 패턴: 배열 + delay + Zod).
 * 작성·발행은 관리자(별도 기능). 본 기능은 발행된 공지 조회만. 정렬은 listNotices 에서 sortNotices 적용.
 * 시드 = 사장 프로토타입 `NOTICES` 5건. 태그는 노션 3종(공지/이벤트/업데이트)으로 매핑(필독·점검·안내→공지),
 * 필독(정산 일정)은 핀 고정.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const NOTICES: Notice[] = [
  {
    id: 'n1',
    tag: 'notice',
    pinned: true,
    date: '2025-05-15',
    title: '5월 정산 일정 안내',
    body: '5월 매출 정산은 6월 10일(화)에 일괄 진행됩니다.\n\n· 정산 마감일: 5월 31일 23:59\n· 정산 지급일: 6월 10일\n· 세금계산서 발행: 6월 5일 ~ 6월 9일\n\n정산 계좌가 변경된 사장님은 6월 1일까지 마이 > 매장 정보 수정에서 업데이트해 주세요. 변경 후에는 변경된 계좌로 입금됩니다.',
  },
  {
    id: 'n2',
    tag: 'update',
    pinned: false,
    date: '2025-05-10',
    title: '"마감 할인" 워딩 변경 안내',
    body: '고객 앱과 사장님 앱 전반에서 "떨이"라는 워딩을 "마감 할인"으로 통일하였습니다.\n\n변경 이유:\n· 더 긍정적이고 명확한 의미 전달\n· 마감픽 서비스 정체성과 일관성 강화\n\n기능과 흐름은 동일하므로 별도 조치는 필요하지 않습니다.',
  },
  {
    id: 'n3',
    tag: 'event',
    pinned: false,
    date: '2025-04-28',
    title: '신규 사장님 환영 프로모션',
    body: '5월 1일부터 5월 31일까지 신규 입점하시는 사장님께 첫 달 수수료를 50% 할인해 드립니다.\n\n· 적용 대상: 2025년 5월 입점 매장\n· 혜택: 첫 1개월간 수수료 50% 차감\n· 자동 적용: 별도 신청 없이 자동 반영\n\n주변 사장님께도 알려주시면 추천 보너스(₩30,000)를 드립니다.',
  },
  {
    id: 'n4',
    tag: 'notice',
    pinned: false,
    date: '2025-04-20',
    title: '서버 점검 안내 (4/25 03:00 ~ 05:00)',
    body: '안정적인 서비스 제공을 위해 다음 일정에 서버 점검을 진행합니다.\n\n· 일시: 2025년 4월 25일(금) 03:00 ~ 05:00 (약 2시간)\n· 영향: 점검 시간 동안 사장님 앱·고객 앱·정산 화면 모두 일시 중단\n\n점검 시간 외에는 정상 이용 가능합니다. 양해 부탁드립니다.',
  },
  {
    id: 'n5',
    tag: 'notice',
    pinned: false,
    date: '2025-04-10',
    title: '카카오 우편번호 검색 연동',
    body: '매장 등록·수정 시 주소 입력이 더 편리해졌습니다.\n\n· 도로명·지번·건물명으로 검색 가능\n· 검색 결과 클릭만으로 자동 입력\n· 상세 주소(동·층·호수)는 별도 입력\n\n기존 주소 데이터는 그대로 유지되며, 수정이 필요한 경우에만 업데이트해 주세요.',
  },
].map((notice) => noticeSchema.parse(notice))

export const noticeApi = {
  /** 발행된 공지 — 핀 우선·최신순 정렬해 반환 */
  async listNotices(): Promise<Notice[]> {
    await delay(250)
    return sortNotices(NOTICES)
  },
}
