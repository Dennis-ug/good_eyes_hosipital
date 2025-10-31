-- Refactor optics system to only handle frames from inventory
-- Lenses will be generated dynamically, not stored as inventory items
-- This migration removes lens-related fields and keeps only frame-related fields

-- Remove lens-specific fields from inventory_items
ALTER TABLE inventory_items DROP COLUMN IF EXISTS lens_power;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS lens_material;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS is_prescription_required;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS optics_category;

-- Remove lens-related indexes
DROP INDEX IF EXISTS idx_inventory_lens_power;
DROP INDEX IF EXISTS idx_inventory_optics_category;

-- Update optics_type to only allow FRAME values
UPDATE inventory_items SET optics_type = 'FRAME' WHERE optics_type = 'LENS';

-- Clean up sample lens data (they will be generated dynamically)
DELETE FROM inventory_items WHERE optics_type = 'LENS' AND sku LIKE 'LENS-%';

-- Update comments for documentation
COMMENT ON COLUMN inventory_items.optics_type IS 'Type of optics item: FRAME, ACCESSORY (LENSES are generated dynamically)';
COMMENT ON COLUMN inventory_items.frame_shape IS 'Shape of eyeglass frame: Round, Square, Rectangular, Oval, etc.';
COMMENT ON COLUMN inventory_items.frame_size IS 'Frame size in Bridge-Temple format (e.g., 52-18-140)';
COMMENT ON COLUMN inventory_items.frame_material IS 'Material used for frames: Metal, Plastic, Titanium, etc.';

-- Create new index for frame-specific queries
CREATE INDEX IF NOT EXISTS idx_inventory_frame_shape ON inventory_items(frame_shape);
CREATE INDEX IF NOT EXISTS idx_inventory_frame_material ON inventory_items(frame_material);

-- Update existing frame data to ensure consistency
UPDATE inventory_items SET
    optics_type = 'FRAME',
    frame_shape = COALESCE(frame_shape, 'Rectangular'),
    frame_material = COALESCE(frame_material, 'Plastic'),
    frame_size = COALESCE(frame_size, '52-18-140')
WHERE optics_type = 'FRAME';

-- Removed sample frame inserts; frames should come from real inventory data only
