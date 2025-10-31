-- Fix duplicate phone numbers in patients table
-- This script should be run before applying the unique constraint migration

-- First, let's see what duplicates we have
SELECT 'DUPLICATE PRIMARY PHONES:' as info;
SELECT phone, COUNT(*) as count, array_agg(id) as patient_ids, array_agg(first_name || ' ' || last_name) as patient_names
FROM patients 
WHERE phone IS NOT NULL AND phone != '' AND deleted = false
GROUP BY phone 
HAVING COUNT(*) > 1
ORDER BY count DESC;

SELECT 'DUPLICATE ALTERNATIVE PHONES:' as info;
SELECT alternative_phone, COUNT(*) as count, array_agg(id) as patient_ids, array_agg(first_name || ' ' || last_name) as patient_names
FROM patients 
WHERE alternative_phone IS NOT NULL AND alternative_phone != '' AND deleted = false
GROUP BY alternative_phone 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Fix strategy: For each duplicate phone number, keep the phone for the patient with the lowest ID
-- and clear it for the others (set to NULL)

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

-- Verify the fixes
SELECT 'VERIFICATION - PRIMARY PHONES:' as info;
SELECT phone, COUNT(*) as count
FROM patients 
WHERE phone IS NOT NULL AND phone != '' AND deleted = false
GROUP BY phone 
HAVING COUNT(*) > 1
ORDER BY count DESC;

SELECT 'VERIFICATION - ALTERNATIVE PHONES:' as info;
SELECT alternative_phone, COUNT(*) as count
FROM patients 
WHERE alternative_phone IS NOT NULL AND alternative_phone != '' AND deleted = false
GROUP BY alternative_phone 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Show summary of changes
SELECT 'SUMMARY OF CHANGES:' as info;
SELECT 
  'Patients with cleared primary phone' as change_type,
  COUNT(*) as count
FROM patients 
WHERE phone IS NULL AND deleted = false;

SELECT 
  'Patients with cleared alternative phone' as change_type,
  COUNT(*) as count
FROM patients 
WHERE alternative_phone IS NULL AND deleted = false;
