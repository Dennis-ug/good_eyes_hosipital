-- Fix patient_number column to be nullable
-- This migration makes the patient_number column nullable to handle existing data

-- First, drop the unique constraint if it exists (to avoid conflicts)
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_patient_number_key;

-- Make the column nullable
ALTER TABLE patients ALTER COLUMN patient_number DROP NOT NULL;

-- Re-add the unique constraint (but allow nulls)
ALTER TABLE patients ADD CONSTRAINT patients_patient_number_unique UNIQUE (patient_number); 