export const TICKET_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
} as const

export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

export const DBMS_TYPES = [
  'MySQL', 'PostgreSQL', 'MariaDB', 'MongoDB', 'Redis', 'SingleStore', 'HeatWave', 'EDB',
] as const

export const WORK_CATEGORIES = [
  '장애대응', '성능튜닝', '아키텍처설계', '정기점검',
  '패치업그레이드', '패치/업그레이드', '기술 미팅', '마이그레이션', 'Documentation',
] as const

export const INSTANCE_ENVS = ['prod', 'stg', 'dev'] as const

export const COMMENT_TYPES = ['note', 'solution', 'workaround', 'reference'] as const

export const USER_ROLES = ['admin', 'user'] as const

export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS]
export type Severity = typeof SEVERITY[keyof typeof SEVERITY]
export type DbmsType = typeof DBMS_TYPES[number]
export type WorkCategory = typeof WORK_CATEGORIES[number]
export type InstanceEnv = typeof INSTANCE_ENVS[number]
export type CommentType = typeof COMMENT_TYPES[number]
export type UserRole = typeof USER_ROLES[number]
