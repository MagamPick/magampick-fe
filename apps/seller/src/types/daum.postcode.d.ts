export {}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: DaumPostcodeOptions) => DaumPostcode
    }
  }

  interface DaumPostcodeOptions {
    oncomplete: (data: DaumPostcodeData) => void
  }

  interface DaumPostcode {
    open: () => void
  }

  interface DaumPostcodeData {
    roadAddress: string
    jibunAddress: string
    zonecode: string
    sigunguCode: string
    roadnameCode: string
  }
}
