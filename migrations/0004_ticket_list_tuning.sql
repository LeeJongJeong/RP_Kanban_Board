-- ============================================
-- Migration 0004: Ticket List Performance Tuning
-- 티켓 목록 조회 및 정렬 최적화
-- ============================================

-- 1. 기본 정렬 최적화 (Priority + CreatedAt)
-- ORDER BY priority ASC, created_at DESC 쿼리를 Filesort 없이 처리
CREATE INDEX IF NOT EXISTS idx_tickets_priority_created ON tickets(priority ASC, created_at DESC);

-- 2. 주간/기간 조회 + 정렬 최적화
-- WHERE week_start_date = ? ORDER BY priority 쿼리 가속화
-- 이미 week_start_date 인덱스가 있지만, priority 정렬까지 포함된 복합 인덱스가 더 효율적임
CREATE INDEX IF NOT EXISTS idx_tickets_week_priority ON tickets(week_start_date, priority);
