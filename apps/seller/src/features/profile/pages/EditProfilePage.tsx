import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import { useProfile } from '../hooks/useProfile'
import { NameEditSheet } from '../components/NameEditSheet'

const COMING_SOON = '준비 중인 기능이에요'

/** 편집 행 공통 클래스 (프로토타입 .profile-edit-row — 아이콘 없음, py16, min-h56) */
const EDIT_ROW =
  'flex min-h-[56px] w-full items-center gap-[11px] border-b border-border px-4 py-4 text-left last:border-b-0'
const ROW_LABEL = 'shrink-0 text-[14.5px] font-semibold text-foreground'
const ROW_VALUE = 'ml-auto max-w-[56%] truncate text-[13.5px] text-muted-foreground'
const ROW_CHEVRON = 'size-[18px] shrink-0 text-[#bdbdbd]'

/**
 * 내 정보 수정 (프로토타입 53-profile-edit). 노션 "사장 프로필 관리".
 * 실명만 실제 수정(시트). 대표 이메일 = 읽기 전용(계정 식별자). 비밀번호·휴대폰·사진 = 비범위 → 준비 중.
 */
function EditProfileContent() {
  const navigate = useNavigate()
  const { show } = useComingSoon()
  const { data: profile, isPending } = useProfile()
  const [sheetOpen, setSheetOpen] = useState(false)

  const soon = () => show(COMING_SOON)

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">내 정보 수정</h1>
      </header>

      <main className="flex-1">
        {isPending || !profile ? (
          <div className="px-5">
            <div className="mx-auto mt-7 size-24 animate-pulse rounded-full bg-muted" />
            <div className="mt-[18px] h-[228px] animate-pulse rounded-[14px] bg-muted" />
          </div>
        ) : (
          <>
            {/* 아바타 (사진 변경은 비범위 → 탭 시 준비 중) */}
            <div className="flex justify-center pb-2 pt-7">
              <button
                type="button"
                onClick={soon}
                aria-label="프로필 사진 변경"
                className="relative flex size-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF8A5C_0%,#FF6B35_100%)] transition active:scale-95"
              >
                <span aria-hidden className="text-[56px] leading-none">
                  {profile.avatarEmoji}
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-0.5 flex size-[30px] items-center justify-center rounded-full border-2 border-card bg-foreground text-[14px]"
                >
                  📷
                </span>
              </button>
            </div>

            {/* 정보 카드 */}
            <div className="mx-5 mt-[18px] overflow-hidden rounded-[14px] border border-border bg-card">
              {/* 실명 — 수정 가능 */}
              <button type="button" onClick={() => setSheetOpen(true)} className={EDIT_ROW}>
                <span className={ROW_LABEL}>실명</span>
                <span className={ROW_VALUE}>{profile.name}</span>
                <ChevronRight className={ROW_CHEVRON} aria-hidden />
              </button>

              {/* 대표 이메일 — 읽기 전용(계정 식별자) */}
              <div className={EDIT_ROW}>
                <span className={ROW_LABEL}>대표 이메일</span>
                <span className={ROW_VALUE}>{profile.email}</span>
              </div>

              {/* 비밀번호 변경 — 비범위(별도 인증 기능) */}
              <button type="button" onClick={soon} className={EDIT_ROW}>
                <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                  비밀번호 변경
                </span>
                <ChevronRight className={ROW_CHEVRON} aria-hidden />
              </button>

              {/* 휴대폰 번호 변경 — 비범위(OTP 재인증 별도) */}
              <button type="button" onClick={soon} className={EDIT_ROW}>
                <span className={ROW_LABEL}>휴대폰 번호 변경</span>
                <span className={ROW_VALUE}>{profile.phone}</span>
                <ChevronRight className={ROW_CHEVRON} aria-hidden />
              </button>
            </div>

            <NameEditSheet open={sheetOpen} onOpenChange={setSheetOpen} currentName={profile.name} />
          </>
        )}
      </main>
    </ScreenContainer>
  )
}

export function EditProfilePage() {
  return (
    <ComingSoonProvider>
      <EditProfileContent />
    </ComingSoonProvider>
  )
}
