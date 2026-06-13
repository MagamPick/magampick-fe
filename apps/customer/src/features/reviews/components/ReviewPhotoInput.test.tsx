import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewPhotoInput } from './ReviewPhotoInput'
import type { ReviewPhoto } from '../types'

/** 기존 사진 한 장 (http URL) */
const existing = (url: string): ReviewPhoto => ({ kind: 'existing', url })

describe('ReviewPhotoInput', () => {
  beforeAll(() => {
    // jsdom 미구현 — 새 File 미리보기용 objectURL 스텁
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })

  it('사진_3장이면_추가_버튼_숨김', () => {
    render(<ReviewPhotoInput value={[existing('a'), existing('b'), existing('c')]} onChange={() => {}} />)
    expect(screen.queryByText('사진 추가')).not.toBeInTheDocument()
  })

  it('3장_미만이면_추가_버튼_노출', () => {
    render(<ReviewPhotoInput value={[existing('a')]} onChange={() => {}} />)
    expect(screen.getByText('사진 추가')).toBeInTheDocument()
  })

  it('기존_사진은_url_을_그대로_미리보기로_표시', () => {
    render(<ReviewPhotoInput value={[existing('https://cdn.example.com/p.jpg')]} onChange={() => {}} />)
    expect(screen.getByRole('img', { name: '첨부 사진 1' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/p.jpg',
    )
  })

  it('삭제_버튼_클릭_시_해당_사진_제거', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ReviewPhotoInput value={[existing('a'), existing('b')]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '사진 1 삭제' }))
    expect(onChange).toHaveBeenCalledWith([existing('b')])
  })

  it('파일_선택_시_kind_new_사진으로_onChange', () => {
    const onChange = vi.fn()
    const { container } = render(<ReviewPhotoInput value={[]} onChange={onChange} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['x'], 'photo.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })
    expect(onChange).toHaveBeenCalledWith([{ kind: 'new', file }])
  })

  it('남은_칸보다_많이_고르면_3장까지만_추가', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ReviewPhotoInput value={[existing('a')]} onChange={onChange} />,
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const files = [
      new File(['1'], '1.png', { type: 'image/png' }),
      new File(['2'], '2.png', { type: 'image/png' }),
      new File(['3'], '3.png', { type: 'image/png' }),
    ]

    fireEvent.change(input, { target: { files } })
    // 기존 1장 + 빈 칸 2 → 새 2장만 추가
    const next = onChange.mock.calls[0][0] as ReviewPhoto[]
    expect(next).toHaveLength(3)
    expect(next.filter((p) => p.kind === 'new')).toHaveLength(2)
  })
})
