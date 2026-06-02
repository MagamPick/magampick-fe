import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { NotificationSettingItem } from '../components/NotificationSettingItem'
import { useNotificationSettings } from '../hooks/useNotificationSettings'
import { useUpdateNotificationSetting } from '../hooks/useUpdateNotificationSetting'
import { CUSTOMER_SETTING_META } from '../constants'

/**
 * 알림 설정 (프로토타입 61-notif-settings) — 백헤더 + 안내문 + 토글 6종.
 * 마이 → 알림 설정 진입. 토글 = 낙관적 업데이트(useUpdateNotificationSetting).
 */
export function NotificationSettingsPage() {
  const navigate = useNavigate()
  const { data: settings } = useNotificationSettings()
  const update = useUpdateNotificationSetting()

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex size-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">알림 설정</h1>
      </header>

      <main className="flex-1">
        <p className="px-5 py-4 text-[13px] text-muted-foreground">
          받고 싶은 알림만 켜두세요. 설정은 언제든 변경할 수 있어요.
        </p>
        <div className="divide-y divide-border">
          {CUSTOMER_SETTING_META.map((meta) => (
            <NotificationSettingItem
              key={meta.key}
              meta={meta}
              checked={settings?.[meta.key] ?? false}
              onCheckedChange={(on) => update.mutate({ key: meta.key, on })}
            />
          ))}
        </div>
      </main>
    </ScreenContainer>
  )
}
