-- Fix end_time column type to match Java LocalTime entity
-- This migration fixes the data type mismatch between database and Java entity

-- First, create a temporary column to hold the time portion only
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time_temp TIME;

-- Copy the time portion from the existing end_time column (if it exists)
-- This will extract just the time part from any timestamp values
UPDATE appointments
SET end_time_temp = end_time::TIME
WHERE end_time IS NOT NULL;

-- Drop the original column
ALTER TABLE appointments DROP COLUMN IF EXISTS end_time;

-- Rename the temporary column to the correct name
ALTER TABLE appointments RENAME COLUMN end_time_temp TO end_time;

-- Make sure the column has the correct constraints
ALTER TABLE appointments ALTER COLUMN end_time SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_end_time ON appointments(end_time);
