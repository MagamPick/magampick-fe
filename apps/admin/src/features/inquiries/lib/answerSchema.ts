import { z } from 'zod'

/**
 * 답변 입력 검증 (BE AdminInquiryAnswerRequest).
 * content: NotBlank(trim 후 1자 이상) · max 2000.
 */
export const answerInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, '답변 내용을 입력해 주세요')
    .max(2000, '답변은 2000자까지 입력할 수 있어요'),
})
export type AnswerInput = z.infer<typeof answerInputSchema>
