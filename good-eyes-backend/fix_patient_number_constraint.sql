-- Fix patient_number column constraint issue
-- Run this script manually in your database to fix the NOT NULL constraint

-- First, drop the unique constraint if it exists (to avoid conflicts)
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_patient_number_key;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_patient_number_unique;

-- Make the column nullable
ALTER TABLE patients ALTER COLUMN patient_number DROP NOT NULL;

-- Re-add the unique constraint (but allow nulls)
ALTER TABLE patients ADD CONSTRAINT patients_patient_number_unique UNIQUE (patient_number);

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' AND column_name = 'patient_number'; 