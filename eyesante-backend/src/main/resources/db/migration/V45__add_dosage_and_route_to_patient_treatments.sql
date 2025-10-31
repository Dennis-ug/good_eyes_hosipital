-- Add dosage and administration_route to patient_treatments
ALTER TABLE patient_treatments
  ADD COLUMN IF NOT EXISTS dosage VARCHAR(255);

ALTER TABLE patient_treatments
  ADD COLUMN IF NOT EXISTS administration_route VARCHAR(100);


