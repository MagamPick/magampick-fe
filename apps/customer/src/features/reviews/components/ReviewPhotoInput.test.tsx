import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewPhotoInput } from './ReviewPhotoInput'

describe('ReviewPhotoInput', () => {
  it('사진_3장이면_추가_버튼_숨김', () => {
    render(<ReviewPhotoInput value={['a', 'b', 'c']} onChange={() => {}} />)
    expect(screen.queryByText('사진 추가')).not.toBeInTheDocument()
  })

  it('3장_미만이면_추가_버튼_노출', () => {
    render(<ReviewPhotoInput value={['a']} onChange={() => {}} />)
    expect(screen.getByText('사진 추가')).toBeInTheDocument()
  })

  it('삭제_버튼_클릭_시_해당_사진_제거', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ReviewPhotoInput value={['a', 'b']} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '사진 1 삭제' }))
    expect(onChange).toHaveBeenCalledWith(['b'])
  })
})
