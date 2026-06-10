import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import { ROUTES } from '@/shared/lib/routes'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { usePointSummary } from '@/features/points/hooks/usePointSummary'
import { useCoupons } from '@/features/coupons/hooks/useCoupons'
import { useProfile } from '../hooks/useProfile'
import { useProfileStats } from '../hooks/useProfileStats'
import { ProfileHeader } from '../components/ProfileHeader'
import { ProfileStats } from '../components/ProfileStats'
import { MenuGroup } from '../components/MenuGroup'
import { MenuRow } from '../components/MenuRow'

const COMING_SOON = '준비 중인 기능이에요'

/**
 * 마이페이지 허브 (프로토타입 25-mypage). 프로필 + 통계 + 메뉴 그룹 4개.
 * 구현된 진입점만 실제 라우트로 연결(주소·찜·프로필 수정·로그아웃), 미구현은 "준비 중" 토스트.
 */
function MyPageContent() {
  const { data: profile } = useProfile()
  const { data: stats } = useProfileStats()
  const { data: pointSummary } = usePointSummary()
  const { data: coupons } = useCoupons()
  const { show } = useComingSoon()
  const logout = useLogout()

  const pointValue =
    pointSummary != null ? `${pointSummary.balance.toLocaleString('ko-KR')}P` : undefined
  const usableCouponValue =
    coupons != null ? `${coupons.filter((c) => c.status === 'USABLE').length}장` : undefined

  const soon = () => show(COMING_SOON)
  const handleLogout = () => {
    if (window.confirm('로그아웃 할까요?')) logout.mutate()
  }

  return (
    <ScreenContainer variant="tab" className="pb-6 pt-[env(safe-area-inset-top,0px)]">
      <h1 className="sr-only">마이</h1>

      {profile ? (
        <ProfileHeader nickname={profile.nickname} avatarEmoji={profile.avatarEmoji} />
      ) : (
        <div className="flex items-center gap-[14px] px-5 py-5">
          <div className="size-[60px] shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </div>
      )}

      {stats ? (
        <ProfileStats stats={stats} />
      ) : (
        <div className="mx-5 h-[68px] animate-pulse rounded-[14px] bg-muted" />
      )}

      <MenuGroup title="혜택">
        <MenuRow icon="🎉" label="이벤트" to={ROUTES.EVENTS} />
        <MenuRow icon="🪙" label="포인트" value={pointValue} to={ROUTES.POINTS} />
        <MenuRow icon="🎁" label="쿠폰함" value={usableCouponValue} to={ROUTES.COUPONS} />
      </MenuGroup>

      <MenuGroup title="활동">
        <MenuRow icon="❤️" label="찜한 가게" to={ROUTES.FAVS} />
        <MenuRow icon="✍️" label="내가 쓴 리뷰" to={ROUTES.MY_REVIEWS} />
      </MenuGroup>

      <MenuGroup title="설정 · 지원">
        <MenuRow icon="📍" label="주소 관리" to={ROUTES.ADDRESSES} />
        <MenuRow icon="🔔" label="알림 설정" to={ROUTES.NOTIFICATION_SETTINGS} />
        <MenuRow icon="📢" label="공지사항" to={ROUTES.NOTICES} />
        <MenuRow icon="🎧" label="고객센터" to={ROUTES.SUPPORT} />
        <MenuRow icon="ℹ️" label="앱 버전" value="v1.0.0" />
      </MenuGroup>

      <MenuGroup title="계정">
        <MenuRow icon="🚪" label="로그아웃" danger onClick={handleLogout} />
        <MenuRow icon="🗑️" label="회원 탈퇴" danger onClick={soon} />
      </MenuGroup>
    </ScreenContainer>
  )
}

export function MyPage() {
  return (
    <ComingSoonProvider>
      <MyPageContent />
    </ComingSoonProvider>
  )
}
