-- 모든 티켓을 이번 주(2026-01-26 ~ 2026-02-01)로 업데이트
UPDATE tickets SET 
  week_start_date = '2026-01-26',
  week_end_date = '2026-02-01',
  year_week = '2026-W05'
WHERE week_start_date = '2026-01-20';
