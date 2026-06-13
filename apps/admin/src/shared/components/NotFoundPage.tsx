import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-card px-5 text-center">
      <h1 className="text-xl font-bold text-foreground">페이지를 찾을 수 없습니다</h1>
      <Link to={ROUTES.EVENTS} className="text-primary underline">
        이벤트 관리로
      </Link>
    </main>
  )
}
