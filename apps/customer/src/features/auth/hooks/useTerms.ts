import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { authKeys } from './authKeys'

export function useTerms() {
  return useQuery({
    queryKey: authKeys.terms(),
    queryFn: () => authApi.listTerms(),
  })
}
