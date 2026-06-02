import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import { ROUTES } from '@/shared/lib/routes'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useProfile } from '../hooks/useProfile'
import { SellerProfileCard } from '../components/SellerProfileCard'
import { SettlementSummaryCard } from '@/features/settlement/components/SettlementSummaryCard'
import { MenuGroup } from '../components/MenuGroup'
import { MenuRow } from '../components/MenuRow'

const COMING_SOON = '준비 중인 기능이에요'

/**
 * 사장 마이 허브 (프로토타입 24-mypage). 프로필 카드 + 정산 카드 + 메뉴 그룹 3개.
 * 구현된 진입점만 실제 라우트로 연결(보유 매장·내 정보 수정·로그아웃), 미구현은 "준비 중" 토스트.
 * 바텀네비 탭(TabLayout 자식) — 본문만 렌더(tab variant), 뒤로가기 헤더 없음(소비자 MyPage 미러).
 */
function SellerMyPageContent() {
  const { data: profile } = useProfile()
  const { show } = useComingSoon()
  const logout = useLogout()

  const soon = () => show(COMING_SOON)
  const handleLogout = () => {
    if (window.confirm('로그아웃 할까요?')) logout.mutate()
  }

  return (
    <ScreenContainer variant="tab" className="pb-6 pt-[env(safe-area-inset-top,0px)]">
      <h1 className="sr-only">마이</h1>

      {profile ? (
        <SellerProfileCard
          name={profile.name}
          phone={profile.phone}
          avatarEmoji={profile.avatarEmoji}
        />
      ) : (
        <div className="flex items-center gap-[14px] px-5 py-5">
          <div className="size-[60px] shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </div>
      )}

      <SettlementSummaryCard className="mx-5 mt-1" />

      <MenuGroup title="매장 관리">
        <MenuRow icon="🏪" label="보유 매장" to={ROUTES.STORE_MANAGE} />
        <MenuRow icon="💬" label="리뷰 관리" to={ROUTES.REVIEWS} />
        <MenuRow icon="💸" label="환불 관리" to={ROUTES.REFUNDS} />
        <MenuRow icon="💰" label="정산 내역" to={ROUTES.SETTLEMENT} />
      </MenuGroup>

      <MenuGroup title="설정">
        <MenuRow icon="🔔" label="알림 설정" to={ROUTES.NOTIFICATION_SETTINGS} />
        <MenuRow icon="🔒" label="비밀번호 변경" to={ROUTES.PASSWORD_CHANGE} />
        <MenuRow icon="📄" label="약관 및 정책" onClick={soon} />
      </MenuGroup>

      <MenuGroup title="지원">
        <MenuRow icon="📢" label="공지사항" to={ROUTES.NOTICES} />
        <MenuRow icon="🎧" label="고객센터" to={ROUTES.SUPPORT} />
        <MenuRow icon="ℹ️" label="앱 버전" value="v1.0.0" />
        <MenuRow icon="🚪" label="로그아웃" danger onClick={handleLogout} />
        <MenuRow icon="🗑️" label="회원 탈퇴" danger onClick={soon} />
      </MenuGroup>
    </ScreenContainer>
  )
}

export function SellerMyPage() {
  return (
    <ComingSoonProvider>
      <SellerMyPageContent />
    </ComingSoonProvider>
  )
}
