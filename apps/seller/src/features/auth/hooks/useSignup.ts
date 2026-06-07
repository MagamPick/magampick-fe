import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { useAuthStore } from '../stores/authStore'
import type { SignupInput, SellerSignupPayload } from '../types'

/**
 * 사장 회원가입 제출 — SignupInput(폼) → SellerSignupPayload(BE 계약) 매핑 후 multipart 전송.
 * - 폼 name → ownerName, 매장 필드(주소 위젯 결과 + 디테일)는 nested store 로 묶는다.
 * - 성공 시 자동 로그인(access token 저장) 후 사장 메인 직행 — 환영 페이지 없음 (노션 명세).
 * - 대표 사진(선택)은 storeImageFile 을 multipart image 파트로 함께 전송.
 */
export function useSignup() {
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  return useMutation({
    mutationFn: (input: SignupInput) => {
      // stepValid + zodResolver 가 막지만 BE 계약상 매장 주소는 필수 — 방어적으로 가드
      if (!input.storeAddress) {
        throw new ApiError(400, 'STORE_ADDRESS_REQUIRED', '매장 주소를 등록해주세요')
      }
      const payload: SellerSignupPayload = {
        email: input.email,
        password: input.password,
        ownerName: input.name,
        phone: input.phone,
        verificationToken: input.verificationToken,
        agreedTermIds: input.agreedTermIds,
        store: {
          businessNumber: input.businessNumber,
          representativeName: input.representativeName,
          openDate: input.openDate,
          name: input.storeName,
          roadAddress: input.storeAddress.roadAddress,
          jibunAddress: input.storeAddress.jibunAddress,
          detailAddress: input.storeAddressDetail || undefined,
          zonecode: input.storeAddress.zonecode,
          phone: input.storePhone,
          sigunguCode: input.storeAddress.sigunguCode,
          roadnameCode: input.storeAddress.roadnameCode,
        },
      }
      return authApi.signup(payload, input.storeImageFile)
    },
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken)
      navigate(ROUTES.HOME, { replace: true })
    },
  })
}
