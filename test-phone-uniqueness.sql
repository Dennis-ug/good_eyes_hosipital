-- Test script to verify phone uniqueness logic
-- This script tests the logic that will be used in the migration

-- First, let's see the current state
SELECT 'CURRENT STATE - PRIMARY PHONES:' as info;
SELECT phone, COUNT(*) as count, array_agg(id) as patient_ids, array_agg(first_name || ' ' || last_name) as patient_names
FROM patients 
WHERE phone IS NOT NULL AND phone != '' AND deleted = false
GROUP BY phone 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Test the fix logic (without actually applying it)
WITH duplicate_phones AS (
  SELECT phone, MIN(id) as keep_id
  FROM patients 
  WHERE phone IS NOT NULL AND phone != '' AND deleted = false
  GROUP BY phone 
  HAVING COUNT(*) > 1
)
SELECT 'WOULD CLEAR PHONE FOR THESE PATIENTS:' as info, 
       p.id, p.first_name, p.last_name, p.phone
FROM patients p
WHERE p.phone IN (SELECT phone FROM duplicate_phones) 
  AND p.id NOT IN (SELECT keep_id FROM duplicate_phones)
  AND p.deleted = false;

-- Test the final state after fix
WITH duplicate_phones AS (
  SELECT phone, MIN(id) as keep_id
  FROM patients 
  WHERE phone IS NOT NULL AND phone != '' AND deleted = false
  GROUP BY phone 
  HAVING COUNT(*) > 1
),
cleared_phones AS (
  SELECT phone
  FROM duplicate_phones
)
SELECT 'AFTER FIX - PRIMARY PHONES:' as info;
SELECT phone, COUNT(*) as count
FROM patients 
WHERE phone IS NOT NULL AND phone != '' AND deleted = false
  AND phone NOT IN (SELECT phone FROM cleared_phones)
GROUP BY phone 
HAVING COUNT(*) > 1
ORDER BY count DESC;
