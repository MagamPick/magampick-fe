import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstallPrompt } from './InstallPrompt'

function fireBeforeInstallPrompt() {
  const event = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void> }
  event.prompt = vi.fn().mockResolvedValue(undefined)
  act(() => window.dispatchEvent(event))
  return event
}

describe('InstallPrompt', () => {
  it('설치 불가 상태면 렌더하지 않는다', () => {
    render(<InstallPrompt />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('설치 가능해지면 설치 버튼을 띄우고, 클릭 시 브라우저 prompt 를 호출한다', async () => {
    const user = userEvent.setup()
    render(<InstallPrompt />)
    const event = fireBeforeInstallPrompt()
    await user.click(screen.getByRole('button', { name: '설치' }))
    await waitFor(() => expect(event.prompt).toHaveBeenCalled())
  })

  it('닫기를 누르면 배너가 사라진다', async () => {
    const user = userEvent.setup()
    render(<InstallPrompt />)
    fireBeforeInstallPrompt()
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
