/** Simplified Chinese dictionary. */
export const zh = {
  nav: 'Token 用量',
  title: 'Token 用量',
  description: '用量为固定 Mock 数据，限额读取自用户设置。',
  used: '已用 Token',
  limit: 'Token 限额',
  progress: 'Token 使用进度',
} satisfies Record<string, string>

/** Token Usage dictionary key. */
export type TokenUsageKey = keyof typeof zh

/** English dictionary. */
export const en = {
  nav: 'Token usage',
  title: 'Token usage',
  description: 'Usage is fixed mock data; the limit comes from user settings.',
  used: 'Tokens used',
  limit: 'Token limit',
  progress: 'Token usage progress',
} satisfies Record<TokenUsageKey, string>
