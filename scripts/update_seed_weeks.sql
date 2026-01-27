-- 모든 티켓에 이번 주(2026-01-20 ~ 2026-01-26) 주차 정보 추가
UPDATE tickets SET 
  week_start_date = '2026-01-20',
  week_end_date = '2026-01-26',
  year_week = '2026-W04'
WHERE week_start_date IS NULL;
