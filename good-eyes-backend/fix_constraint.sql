-- Fix patient_number constraint issue
-- Run this in your database to make the column nullable

-- Drop any existing constraints
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