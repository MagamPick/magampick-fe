export const supportKeys = {
  all: ['support'] as const,
  faqs: () => ['support', 'faqs'] as const,
  inquiries: () => ['support', 'inquiries'] as const,
  inquiry: (id: string) => ['support', 'inquiry', id] as const,
}
