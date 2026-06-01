export const orderKeys = {
  all: ['customerOrders'] as const,
  list: () => ['customerOrders', 'list'] as const,
  detail: (id: string) => ['customerOrders', 'detail', id] as const,
}
