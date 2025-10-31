-- Add patient_number column to patients table (nullable initially)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_number VARCHAR(20);

-- Create index for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_patients_patient_number ON patients(patient_number);

-- Update existing patients with generated patient numbers
-- This will be handled by the application logic for existing patients
-- New patients will get patient numbers automatically generated 