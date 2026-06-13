/** 공지(announcements) 도메인 queryKey 헬퍼 (state-convention §3) */
export const announcementKeys = {
  all: ['announcements'] as const,
  list: () => [...announcementKeys.all, 'list'] as const,
}
