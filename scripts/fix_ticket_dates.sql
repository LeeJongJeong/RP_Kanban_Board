-- 모든 티켓을 현재 주차(2026-01-26 ~ 2026-02-01)로 이동
UPDATE tickets 
SET 
  week_start_date = '2026-01-26',
  week_end_date = '2026-02-01',
  year_week = '2026-W05';
