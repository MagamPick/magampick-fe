import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddressFormPage } from './AddressFormPage'
import { addressesApi } from '../api/addressesApi'
import type { AddressSearchResult } from '../types'

// 실 BE 호출 없이 제출 payload 만 검증 — 훅(useCreateAddress)→mutation→api 체인은 실제로 탄다
vi.mock('../api/addressesApi', () => ({
  addressesApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({
      id: 2,
      label: '우리집',
      roadAddress: '서울 마포구 양화로 45',
      detailAddress: '',
      latitude: 37.5571,
      longitude: 126.925,
      isDefault: false,
    }),
    update: vi.fn(),
    remove: vi.fn(),
    setDefault: vi.fn(),
    reverseGeocode: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

/** GPS 역지오코딩 결과: 좌표 보유, 코드 없음 */
const gpsResult: AddressSearchResult = {
  roadAddress: '서울 마포구 양화로 45',
  latitude: 37.5571,
  longitude: 126.925,
}

/** 다음 위젯 검색 결과: 코드 보유, 좌표 없음 */
const searchResult: AddressSearchResult = {
  roadAddress: '서울 마포구 와우산로 94',
  jibunAddress: '서울 마포구 서교동 357-2',
  zonecode: '04067',
  sigunguCode: '11440',
  roadnameCode: '114403003003',
}

function renderForm(state: { result: AddressSearchResult }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[{ pathname: '/addresses/new', state }]}>
        <AddressFormPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

/** 별칭 칩 클릭 → 제출 버튼 활성화 대기 → 추가하기 */
async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, chip: RegExp) {
  await user.click(screen.getByRole('button', { name: chip }))
  const submit = screen.getByRole('button', { name: '추가하기' })
  await waitFor(() => expect(submit).toBeEnabled())
  await user.click(submit)
  await waitFor(() => expect(addressesApi.create).toHaveBeenCalledTimes(1))
  return vi.mocked(addressesApi.create).mock.calls[0][0]
}

describe('AddressFormPage 주소 추가 — 제출 payload 분기 (X3 / findings A3-1·A3-2·A3-3)', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.mocked(addressesApi.create).mockClear()
  })
  afterEach(() => {
    cleanup()
  })

  it('GPS 경로: 좌표(latitude/longitude)를 전송하고 sigunguCode/roadnameCode 는 보내지 않는다', async () => {
    const user = userEvent.setup()
    renderForm({ result: gpsResult })
    const payload = await fillAndSubmit(user, /우리집/)
    expect(payload).toMatchObject({
      label: '우리집',
      roadAddress: '서울 마포구 양화로 45',
      latitude: 37.5571,
      longitude: 126.925,
    })
    expect(payload.sigunguCode).toBeUndefined()
    expect(payload.roadnameCode).toBeUndefined()
  })

  it('검색 경로: sigunguCode/roadnameCode 를 전송하고 좌표는 보내지 않는다 (회귀 방지)', async () => {
    const user = userEvent.setup()
    renderForm({ result: searchResult })
    const payload = await fillAndSubmit(user, /회사/)
    expect(payload).toMatchObject({
      label: '회사',
      roadAddress: '서울 마포구 와우산로 94',
      sigunguCode: '11440',
      roadnameCode: '114403003003',
    })
    expect(payload.latitude).toBeUndefined()
    expect(payload.longitude).toBeUndefined()
  })
})

/** 기존 주소(좌표 보유, 코드 없음) — 수정 화면 진입 시 목록에서 찾는다 */
const existingAddress = {
  id: 7,
  label: '우리집',
  roadAddress: '서울 마포구 양화로 45',
  jibunAddress: '서울 마포구 합정동 369',
  zonecode: '04022',
  detailAddress: '101동 1203호',
  latitude: 37.5571,
  longitude: 126.925,
  isDefault: true,
}

function renderEditForm(id: number) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/addresses/${id}/edit`]}>
        <Routes>
          <Route path="/addresses/:id/edit" element={<AddressFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AddressFormPage 주소 수정 — 좌표 전송 (findings BUG-B)', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.mocked(addressesApi.list).mockResolvedValue([existingAddress])
    vi.mocked(addressesApi.update).mockClear()
    vi.mocked(addressesApi.update).mockResolvedValue(existingAddress)
  })
  afterEach(() => {
    cleanup()
    vi.mocked(addressesApi.list).mockResolvedValue([])
  })

  it('재검색 없이 별칭만 바꿔도 기존 좌표(latitude/longitude)를 함께 전송한다 (좌표 누락 400 방지)', async () => {
    const user = userEvent.setup()
    renderEditForm(existingAddress.id)

    // 기존 주소 로드 대기 (도로명 표시)
    expect(await screen.findByText('서울 마포구 양화로 45')).toBeInTheDocument()

    // 별칭만 '회사'로 변경 → 저장
    await user.click(screen.getByRole('button', { name: /회사/ }))
    const submit = screen.getByRole('button', { name: '저장' })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() => expect(addressesApi.update).toHaveBeenCalledTimes(1))
    const [calledId, payload] = vi.mocked(addressesApi.update).mock.calls[0]
    expect(calledId).toBe(existingAddress.id)
    expect(payload).toMatchObject({
      label: '회사',
      roadAddress: '서울 마포구 양화로 45',
      latitude: 37.5571,
      longitude: 126.925,
    })
    // 좌표를 보냈으므로 코드는 비운다 (검색 경로 아님)
    expect(payload.sigunguCode).toBeUndefined()
    expect(payload.roadnameCode).toBeUndefined()
  })
})
