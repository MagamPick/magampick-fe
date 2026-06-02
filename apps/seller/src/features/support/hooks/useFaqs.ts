import { useQuery } from '@tanstack/react-query'
import { supportApi } from '../api/supportApi'
import { supportKeys } from './supportKeys'

/** FAQ 목록 */
export function useFaqs() {
  return useQuery({
    queryKey: supportKeys.faqs(),
    queryFn: () => supportApi.listFaqs(),
  })
}
