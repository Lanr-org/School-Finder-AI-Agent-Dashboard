import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVisaRate,
  deleteVisaRate,
  listVisaRates,
  updateVisaRate,
  type ListVisaRatesParams,
} from './visaRates.api.js'

export const useVisaRates = (params: ListVisaRatesParams = {}) =>
  useQuery({
    queryKey: ['visa-rates', params],
    queryFn: () => listVisaRates(params),
  })

const useInvalidateVisaRates = () => {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: ['visa-rates'] })
}

export const useCreateVisaRate = () => {
  const invalidate = useInvalidateVisaRates()
  return useMutation({ mutationFn: createVisaRate, onSuccess: invalidate })
}

export const useUpdateVisaRate = () => {
  const invalidate = useInvalidateVisaRates()

  return useMutation({
    mutationFn: ({ rateId, data }: { rateId: string; data: { isActive?: boolean | undefined } }) =>
      updateVisaRate(rateId, data),
    onSuccess: invalidate,
  })
}

export const useDeleteVisaRate = () => {
  const invalidate = useInvalidateVisaRates()
  return useMutation({ mutationFn: deleteVisaRate, onSuccess: invalidate })
}
