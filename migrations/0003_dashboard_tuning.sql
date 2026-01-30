-- ============================================
-- Migration 0003: Dashboard Performance Tuning
-- 대시보드 조회 속도 향상을 위한 인덱스 추가
-- ============================================

-- 1. 일반 날짜 필드 인덱스 (범위 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_tickets_resolved_at ON tickets(resolved_at);
CREATE INDEX IF NOT EXISTS idx_tickets_started_at ON tickets(started_at);
CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at);

-- 2. 표현식 인덱스 (날짜 함수 검색 최적화)
-- 주간 추세(Week Trend) 조회 시 date() 함수 사용 쿼리 가속화
CREATE INDEX IF NOT EXISTS idx_tickets_date_created ON tickets(date(created_at));
CREATE INDEX IF NOT EXISTS idx_tickets_date_resolved ON tickets(date(resolved_at));
