export const authKeys = {
  all: ['auth'] as const,
  terms: () => ['auth', 'terms'] as const,
}
