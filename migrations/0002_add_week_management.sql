-- 티켓 테이블에 주차 관리 필드 추가
ALTER TABLE tickets ADD COLUMN week_start_date DATE; -- 해당 주의 시작일 (월요일)
ALTER TABLE tickets ADD COLUMN week_end_date DATE;   -- 해당 주의 종료일 (일요일)
ALTER TABLE tickets ADD COLUMN year_week TEXT;       -- 연도-주차 (예: '2026-W04')

-- 주차별 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tickets_week_start_date ON tickets(week_start_date);
CREATE INDEX IF NOT EXISTS idx_tickets_year_week ON tickets(year_week);
