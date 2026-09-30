/** Keys of the icons rendered by <SubjectIcon>. Order matters: it drives the slug → icon hash. */
export const ICON_KEYS = [
  'book',
  'code',
  'database',
  'cpu',
  'briefcase',
  'globe',
  'flask',
  'calculator',
  'network',
  'zap',
  'pen',
  'brain',
] as const

export type IconKey = (typeof ICON_KEYS)[number]
