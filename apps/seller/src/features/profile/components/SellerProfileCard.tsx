import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'

interface SellerProfileCardProps {
  name: string
  phone: string
  avatarEmoji: string
}

/** 마이 허브 프로필 카드 (프로토타입 24-mypage `.my-profile`) — 아바타 + 실명 + 연락처 + 수정 진입 */
export function SellerProfileCard({ name, phone, avatarEmoji }: SellerProfileCardProps) {
  return (
    <div className="flex items-center gap-[14px] px-5 py-5">
      <div
        aria-hidden
        className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(150deg,#FF8A5C,#FF6B35)] text-[28px]"
      >
        {avatarEmoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px] font-extrabold text-foreground">{name} 사장님</p>
        <p className="truncate text-[13px] font-medium text-muted-foreground">{phone}</p>
      </div>
      <Link
        to={ROUTES.EDIT_PROFILE}
        className="flex min-h-11 shrink-0 items-center rounded-[9px] bg-background px-[13px] text-xs font-bold text-muted-foreground"
      >
        수정
      </Link>
    </div>
  )
}
