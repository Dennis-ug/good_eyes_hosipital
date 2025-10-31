-- Convert doctor_schedules.day_of_week from VARCHAR to INTEGER
-- This fixes errors like: operator does not exist: character varying = integer

-- 1) Normalize whitespace
UPDATE doctor_schedules
SET day_of_week = btrim(day_of_week)
WHERE day_of_week IS NOT NULL;

-- 2) Normalize textual names to numeric strings
UPDATE doctor_schedules SET day_of_week = '1' WHERE UPPER(day_of_week) IN ('MONDAY', 'MON');
UPDATE doctor_schedules SET day_of_week = '2' WHERE UPPER(day_of_week) IN ('TUESDAY', 'TUE', 'TUES');
UPDATE doctor_schedules SET day_of_week = '3' WHERE UPPER(day_of_week) IN ('WEDNESDAY', 'WED');
UPDATE doctor_schedules SET day_of_week = '4' WHERE UPPER(day_of_week) IN ('THURSDAY', 'THU', 'THUR');
UPDATE doctor_schedules SET day_of_week = '5' WHERE UPPER(day_of_week) IN ('FRIDAY', 'FRI');
UPDATE doctor_schedules SET day_of_week = '6' WHERE UPPER(day_of_week) IN ('SATURDAY', 'SAT');
UPDATE doctor_schedules SET day_of_week = '7' WHERE UPPER(day_of_week) IN ('SUNDAY', 'SUN');

-- 3) If there are any invalid/empty values, default to Monday ('1') to preserve NOT NULL constraint
UPDATE doctor_schedules
SET day_of_week = '1'
WHERE (day_of_week IS NULL OR day_of_week = '' OR NOT (day_of_week ~ '^[0-9]+$'));

-- 4) Ensure values are within 1..7; otherwise default to 1
UPDATE doctor_schedules
SET day_of_week = '1'
WHERE (day_of_week::int < 1 OR day_of_week::int > 7);

-- 5) Finally, alter column type to INTEGER
ALTER TABLE doctor_schedules
    ALTER COLUMN day_of_week TYPE INTEGER USING day_of_week::integer,
    ALTER COLUMN day_of_week SET NOT NULL;


