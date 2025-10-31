-- Migration V58: Seed Consumable Usage with Sample Data
-- This migration adds sample consumable usage records for the dashboard

-- Get item IDs and department ID
DO $$
DECLARE
    v_gloves_id BIGINT;
    v_masks_id BIGINT;
    v_gowns_id BIGINT;
    v_wipes_id BIGINT;
    v_sanitizer_id BIGINT;
    v_syringes_id BIGINT;
    v_bandages_id BIGINT;
    v_dept_id BIGINT;
    v_user_id BIGINT;
BEGIN
    -- Get item IDs
    SELECT id INTO v_gloves_id FROM consumable_items WHERE name = 'Surgical Gloves (Large)' LIMIT 1;
    SELECT id INTO v_masks_id FROM consumable_items WHERE name = 'Surgical Masks' LIMIT 1;
    SELECT id INTO v_gowns_id FROM consumable_items WHERE name = 'Surgical Gowns' LIMIT 1;
    SELECT id INTO v_wipes_id FROM consumable_items WHERE name = 'Disinfectant Wipes' LIMIT 1;
    SELECT id INTO v_sanitizer_id FROM consumable_items WHERE name = 'Hand Sanitizer' LIMIT 1;
    SELECT id INTO v_syringes_id FROM consumable_items WHERE name = 'Syringes (10ml)' LIMIT 1;
    SELECT id INTO v_bandages_id FROM consumable_items WHERE name = 'Bandages (Roll)' LIMIT 1;
    
    -- Get department ID
    SELECT id INTO v_dept_id FROM departments ORDER BY id ASC LIMIT 1;
    
    -- Get user ID (first admin user)
    SELECT id INTO v_user_id FROM users WHERE role LIKE '%ADMIN%' ORDER BY id ASC LIMIT 1;

    -- Insert sample usage records (last 7 days)
    INSERT INTO consumable_usage (consumable_item_id, quantity_used, used_by_user_id, department_id, usage_date, purpose, notes, created_at) VALUES
    -- Today
    (v_gloves_id, 2, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '2 hours', 'surgery', 'Used during minor surgical procedure', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    (v_masks_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '4 hours', 'surgery', 'Surgical team protection', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    (v_sanitizer_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '6 hours', 'cleaning', 'Regular hand sanitization', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
    
    -- Yesterday
    (v_gowns_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '3 hours', 'surgery', 'Emergency procedure', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '3 hours'),
    (v_wipes_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '6 hours', 'cleaning', 'Equipment sterilization', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '6 hours'),
    (v_syringes_id, 5, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '8 hours', 'patient_care', 'Vaccination clinic', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '8 hours'),
    
    -- 2 days ago
    (v_bandages_id, 2, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '2 hours', 'patient_care', 'Wound dressing', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '2 hours'),
    (v_gloves_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '5 hours', 'cleaning', 'Cleaning procedure', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '5 hours'),
    (v_masks_id, 2, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '7 hours', 'surgery', 'Major surgery', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '7 hours'),
    
    -- 3 days ago
    (v_sanitizer_id, 2, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '1 hour', 'cleaning', 'Staff sanitization', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '1 hour'),
    (v_wipes_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '4 hours', 'cleaning', 'Surface disinfection', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '4 hours'),
    (v_syringes_id, 3, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '6 hours', 'patient_care', 'Medication administration', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '6 hours'),
    
    -- 4 days ago
    (v_gowns_id, 2, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '2 hours', 'surgery', 'Scheduled surgery', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '2 hours'),
    (v_gloves_id, 3, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '5 hours', 'surgery', 'Multiple procedures', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '5 hours'),
    (v_bandages_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '8 hours', 'patient_care', 'Minor injury treatment', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '8 hours'),
    
    -- 5 days ago
    (v_masks_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '3 hours', 'surgery', 'Consultation room', CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '3 hours'),
    (v_sanitizer_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '6 hours', 'cleaning', 'Regular sanitization', CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '6 hours'),
    (v_wipes_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '9 hours', 'cleaning', 'Equipment cleaning', CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '9 hours'),
    
    -- 6 days ago
    (v_syringes_id, 4, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '1 hour', 'patient_care', 'Blood collection', CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '1 hour'),
    (v_gloves_id, 2, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '4 hours', 'surgery', 'Minor procedure', CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '4 hours'),
    (v_gowns_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '7 hours', 'surgery', 'Emergency case', CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '7 hours'),
    
    -- 7 days ago
    (v_bandages_id, 3, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '2 hours', 'patient_care', 'Multiple wound dressings', CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '2 hours'),
    (v_masks_id, 2, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '5 hours', 'surgery', 'Surgical procedures', CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '5 hours'),
    (v_sanitizer_id, 1, v_user_id, v_dept_id, CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '8 hours', 'cleaning', 'Staff protection', CURRENT_TIMESTAMP - INTERVAL '7 days' - INTERVAL '8 hours');

END $$;
