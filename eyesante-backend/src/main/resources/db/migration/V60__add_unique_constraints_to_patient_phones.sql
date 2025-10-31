-- Add unique constraints to patient phone fields
-- This ensures that phone numbers are unique across all patients

-- First, handle any existing duplicate phone numbers by keeping the one with the lowest ID
-- and clearing the others (setting to NULL)

-- Normalize phone fields: trim whitespace and convert empty strings to NULL
UPDATE patients SET phone = btrim(phone) WHERE phone IS NOT NULL;
UPDATE patients SET alternative_phone = btrim(alternative_phone) WHERE alternative_phone IS NOT NULL;
UPDATE patients SET phone = NULL WHERE phone IS NOT NULL AND phone = '';
UPDATE patients SET alternative_phone = NULL WHERE alternative_phone IS NOT NULL AND alternative_phone = '';

-- Fix duplicate primary phones
WITH duplicate_phones AS (
  SELECT phone, MIN(id) as keep_id
  FROM patients 
  WHERE phone IS NOT NULL AND phone != '' AND deleted = false
  GROUP BY phone 
  HAVING COUNT(*) > 1
)
UPDATE patients 
SET phone = NULL 
WHERE phone IN (SELECT phone FROM duplicate_phones) 
  AND id NOT IN (SELECT keep_id FROM duplicate_phones)
  AND deleted = false;

-- Fix duplicate alternative phones
WITH duplicate_alt_phones AS (
  SELECT alternative_phone, MIN(id) as keep_id
  FROM patients 
  WHERE alternative_phone IS NOT NULL AND alternative_phone != '' AND deleted = false
  GROUP BY alternative_phone 
  HAVING COUNT(*) > 1
)
UPDATE patients 
SET alternative_phone = NULL 
WHERE alternative_phone IN (SELECT alternative_phone FROM duplicate_alt_phones) 
  AND id NOT IN (SELECT keep_id FROM duplicate_alt_phones)
  AND deleted = false;

-- Also exclude empty strings to avoid duplicate '' values
CREATE UNIQUE INDEX uk_patients_phone ON patients (phone) WHERE phone IS NOT NULL AND phone <> '';
CREATE UNIQUE INDEX uk_patients_alternative_phone ON patients (alternative_phone) WHERE alternative_phone IS NOT NULL AND alternative_phone <> '';
