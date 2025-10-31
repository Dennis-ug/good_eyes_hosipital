-- Migration V57: Seed Consumable Items with Sample Data
-- This migration adds sample consumable items for the dashboard

-- Get category IDs
DO $$
DECLARE
    v_surgical_id BIGINT;
    v_cleaning_id BIGINT;
    v_medical_id BIGINT;
    v_office_id BIGINT;
    v_lab_id BIGINT;
BEGIN
    -- Get category IDs
    SELECT id INTO v_surgical_id FROM consumable_categories WHERE name = 'Surgical Supplies' LIMIT 1;
    SELECT id INTO v_cleaning_id FROM consumable_categories WHERE name = 'Cleaning Supplies' LIMIT 1;
    SELECT id INTO v_medical_id FROM consumable_categories WHERE name = 'Medical Equipment' LIMIT 1;
    SELECT id INTO v_office_id FROM consumable_categories WHERE name = 'Office Supplies' LIMIT 1;
    SELECT id INTO v_lab_id FROM consumable_categories WHERE name = 'Laboratory Supplies' LIMIT 1;

    -- Insert sample consumable items
    INSERT INTO consumable_items (name, description, category_id, sku, unit_of_measure, current_stock, minimum_stock_level, maximum_stock_level, reorder_point, reorder_quantity, supplier_name, supplier_contact, cost_per_unit, location, expiry_date, is_active) VALUES
    ('Surgical Gloves (Large)', 'Disposable surgical gloves, size large', v_surgical_id, 'SG-L-001', 'boxes', 5, 20, 100, 15, 50, 'MedSupply Co.', '+256-701-123-456', 25000.00, 'Storage Room A', '2025-12-31', true),
    ('Surgical Masks', '3-ply disposable surgical masks', v_surgical_id, 'SM-001', 'boxes', 12, 25, 200, 20, 100, 'MedSupply Co.', '+256-701-123-456', 15000.00, 'Storage Room A', '2025-12-31', true),
    ('Surgical Gowns', 'Disposable surgical gowns', v_surgical_id, 'SG-001', 'pieces', 8, 15, 80, 10, 40, 'MedSupply Co.', '+256-701-123-456', 45000.00, 'Storage Room A', '2025-12-31', true),
    ('Disinfectant Wipes', 'Hospital-grade disinfectant wipes', v_cleaning_id, 'DW-001', 'containers', 3, 10, 50, 8, 25, 'CleanPro Supplies', '+256-702-234-567', 35000.00, 'Storage Room B', '2025-12-31', true),
    ('Hand Sanitizer', 'Alcohol-based hand sanitizer', v_cleaning_id, 'HS-001', 'bottles', 7, 15, 100, 12, 50, 'CleanPro Supplies', '+256-702-234-567', 12000.00, 'Storage Room B', '2025-12-31', true),
    ('Surface Cleaner', 'Multi-surface cleaner', v_cleaning_id, 'SC-001', 'bottles', 15, 20, 150, 15, 75, 'CleanPro Supplies', '+256-702-234-567', 8000.00, 'Storage Room B', '2025-12-31', true),
    ('Syringes (10ml)', 'Disposable syringes, 10ml', v_medical_id, 'SY-10-001', 'pieces', 45, 50, 500, 40, 200, 'MedEquip Ltd.', '+256-703-345-678', 500.00, 'Storage Room C', '2025-12-31', true),
    ('Needles (21G)', 'Disposable needles, 21 gauge', v_medical_id, 'ND-21-001', 'pieces', 120, 100, 1000, 80, 400, 'MedEquip Ltd.', '+256-703-345-678', 300.00, 'Storage Room C', '2025-12-31', true),
    ('Bandages (Roll)', 'Sterile bandage rolls', v_medical_id, 'BG-R-001', 'rolls', 25, 30, 200, 25, 100, 'MedEquip Ltd.', '+256-703-345-678', 2500.00, 'Storage Room C', '2025-12-31', true),
    ('Gauze Pads', 'Sterile gauze pads 4x4', v_medical_id, 'GP-4X4-001', 'boxes', 18, 25, 150, 20, 75, 'MedEquip Ltd.', '+256-703-345-678', 1800.00, 'Storage Room C', '2025-12-31', true),
    ('Printer Paper (A4)', 'A4 printer paper, 80gsm', v_office_id, 'PP-A4-001', 'reams', 35, 40, 300, 30, 150, 'OfficeMax Uganda', '+256-704-456-789', 15000.00, 'Storage Room D', NULL, true),
    ('Pens (Blue)', 'Blue ballpoint pens', v_office_id, 'PN-B-001', 'boxes', 22, 30, 200, 25, 100, 'OfficeMax Uganda', '+256-704-456-789', 8000.00, 'Storage Room D', NULL, true),
    ('Staples', 'Standard office staples', v_office_id, 'ST-001', 'boxes', 50, 20, 150, 15, 75, 'OfficeMax Uganda', '+256-704-456-789', 3000.00, 'Storage Room D', NULL, true),
    ('Test Tubes', 'Glass test tubes, 10ml', v_lab_id, 'TT-10-001', 'pieces', 8, 50, 500, 40, 200, 'LabSupplies Uganda', '+256-705-567-890', 800.00, 'Storage Room E', '2025-12-31', true),
    ('Microscope Slides', 'Glass microscope slides', v_lab_id, 'MS-001', 'boxes', 12, 20, 100, 15, 50, 'LabSupplies Uganda', '+256-705-567-890', 12000.00, 'Storage Room E', '2025-12-31', true),
    ('Petri Dishes', 'Sterile petri dishes', v_lab_id, 'PD-001', 'boxes', 6, 15, 80, 10, 40, 'LabSupplies Uganda', '+256-705-567-890', 25000.00, 'Storage Room E', '2025-12-31', true),
    ('Cotton Wool', 'Sterile cotton wool', v_medical_id, 'CW-001', 'packets', 30, 25, 200, 20, 100, 'MedEquip Ltd.', '+256-703-345-678', 1500.00, 'Storage Room C', '2025-12-31', true),
    ('Adhesive Tape', 'Medical adhesive tape', v_medical_id, 'AT-001', 'rolls', 40, 30, 250, 25, 125, 'MedEquip Ltd.', '+256-703-345-678', 2000.00, 'Storage Room C', '2025-12-31', true),
    ('Thermometers', 'Digital thermometers', v_medical_id, 'TH-D-001', 'pieces', 15, 20, 100, 15, 50, 'MedEquip Ltd.', '+256-703-345-678', 15000.00, 'Storage Room C', '2025-12-31', true),
    ('Blood Pressure Cuffs', 'Disposable BP cuffs', v_medical_id, 'BPC-001', 'pieces', 10, 15, 80, 10, 40, 'MedEquip Ltd.', '+256-703-345-678', 8000.00, 'Storage Room C', '2025-12-31', true);

END $$;
