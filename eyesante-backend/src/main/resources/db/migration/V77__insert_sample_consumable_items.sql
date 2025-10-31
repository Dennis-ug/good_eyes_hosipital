-- Add existing consumable items to theater store
-- This migration adds existing consumable items to the theater store so they can be used in surgery reports

-- Add existing consumable items to theater store
DO $$
DECLARE
    theater_store_id_var INTEGER;
    item_record RECORD;
BEGIN
    -- Get the theater store ID
    SELECT id INTO theater_store_id_var FROM theater_stores WHERE name = 'Main Theater Store' LIMIT 1;
    
    -- Add surgical and medical consumable items to the theater store
    FOR item_record IN 
        SELECT ci.id, ci.name, ci.sku, ci.current_stock, cc.name as category_name
        FROM consumable_items ci
        JOIN consumable_categories cc ON ci.category_id = cc.id
        WHERE ci.is_active = true 
        AND ci.current_stock > 0
        AND cc.name IN ('Surgical Supplies', 'Medical Equipment')
        AND ci.sku IN ('SG-L-001', 'SM-001', 'SG-001', 'SY-10-001', 'ND-21-001', 'BG-R-001', 'GP-4X4-001', 'CW-001', 'AT-001')
    LOOP
        INSERT INTO theater_store_items (
            theater_store_id, 
            consumable_item_id, 
            quantity_available, 
            minimum_quantity, 
            maximum_quantity, 
            is_sterile, 
            is_active, 
            created_at, 
            updated_at
        )
        VALUES (
            theater_store_id_var,
            item_record.id,
            item_record.current_stock,
            GREATEST(1, item_record.current_stock * 0.1), -- 10% of current stock as minimum, at least 1
            item_record.current_stock * 2,   -- 200% of current stock as maximum
            CASE 
                WHEN item_record.name LIKE '%GLOVES%' OR item_record.name LIKE '%COTTON%' OR item_record.name LIKE '%GAUZE%' OR item_record.name LIKE '%STERILE%' THEN true
                ELSE false
            END,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (theater_store_id, consumable_item_id, batch_number) DO NOTHING;
    END LOOP;
END $$;
