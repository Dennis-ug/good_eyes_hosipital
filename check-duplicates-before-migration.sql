-- Check for duplicate phone numbers before running migration V60
-- Run this to see what duplicates exist in your database

-- Check for duplicate primary phone numbers
SELECT 'DUPLICATE PRIMARY PHONES:' as info;
SELECT phone, COUNT(*) as count, array_agg(id) as patient_ids, array_agg(first_name || ' ' || last_name) as patient_names
FROM patients 
WHERE phone IS NOT NULL AND phone != '' AND deleted = false
GROUP BY phone 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check for duplicate alternative phone numbers
SELECT 'DUPLICATE ALTERNATIVE PHONES:' as info;
SELECT alternative_phone, COUNT(*) as count, array_agg(id) as patient_ids, array_agg(first_name || ' ' || last_name) as patient_names
FROM patients 
WHERE alternative_phone IS NOT NULL AND alternative_phone != '' AND deleted = false
GROUP BY alternative_phone 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check for cases where phone and alternative_phone are the same for the same patient
SELECT 'SAME PHONE FOR PRIMARY AND ALTERNATIVE:' as info;
SELECT id, first_name, last_name, phone, alternative_phone
FROM patients 
WHERE phone IS NOT NULL 
  AND alternative_phone IS NOT NULL 
  AND phone = alternative_phone 
  AND deleted = false;

-- Check for cases where a patient's phone matches another patient's alternative_phone
SELECT 'CROSS-MATCH BETWEEN PHONE AND ALTERNATIVE PHONE:' as info;
SELECT p1.id as patient1_id, p1.first_name as patient1_first_name, p1.last_name as patient1_last_name, p1.phone as patient1_phone,
       p2.id as patient2_id, p2.first_name as patient2_first_name, p2.last_name as patient2_last_name, p2.alternative_phone as patient2_alt_phone
FROM patients p1
JOIN patients p2 ON p1.phone = p2.alternative_phone
WHERE p1.id != p2.id 
  AND p1.phone IS NOT NULL 
  AND p2.alternative_phone IS NOT NULL
  AND p1.deleted = false 
  AND p2.deleted = false;
