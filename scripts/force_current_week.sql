-- Update ALL tickets to the current week (2026-01-26 ~ 2026-02-01)
UPDATE tickets 
SET 
  week_start_date = '2026-01-26', 
  week_end_date = '2026-02-01',
  year_week = '2026-W05';
