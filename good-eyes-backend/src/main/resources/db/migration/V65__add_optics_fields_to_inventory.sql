-- Add optics-specific fields to inventory_items table for lens and frame management
-- This migration enhances the inventory system to support comprehensive optics management

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS optics_type VARCHAR(50);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS lens_power VARCHAR(20);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS lens_material VARCHAR(100);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS frame_shape VARCHAR(50);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS frame_size VARCHAR(20);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS frame_material VARCHAR(100);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS color VARCHAR(100);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS is_prescription_required BOOLEAN DEFAULT FALSE;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS optics_category VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN inventory_items.optics_type IS 'Type of optics item: LENS, FRAME, ACCESSORY';
COMMENT ON COLUMN inventory_items.lens_power IS 'Lens power for prescription lenses (e.g., -2.00, +1.50)';
COMMENT ON COLUMN inventory_items.lens_material IS 'Material used for lenses: Plastic, Polycarbonate, Glass, etc.';
COMMENT ON COLUMN inventory_items.frame_shape IS 'Shape of eyeglass frame: Round, Square, Rectangular, Oval, etc.';
COMMENT ON COLUMN inventory_items.frame_size IS 'Frame size in Bridge-Temple format (e.g., 52-18-140)';
COMMENT ON COLUMN inventory_items.frame_material IS 'Material used for frames: Metal, Plastic, Titanium, etc.';
COMMENT ON COLUMN inventory_items.brand IS 'Brand name of the optics product';
COMMENT ON COLUMN inventory_items.model IS 'Model name or number of the optics product';
COMMENT ON COLUMN inventory_items.color IS 'Color description of the optics product';
COMMENT ON COLUMN inventory_items.is_prescription_required IS 'Whether this item requires a prescription';
COMMENT ON COLUMN inventory_items.optics_category IS 'Category of optics: SINGLE_VISION, BIFOCAL, PROGRESSIVE, SUNGLASSES, etc.';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_optics_type ON inventory_items(optics_type);
CREATE INDEX IF NOT EXISTS idx_inventory_lens_power ON inventory_items(lens_power);
CREATE INDEX IF NOT EXISTS idx_inventory_brand ON inventory_items(brand);
CREATE INDEX IF NOT EXISTS idx_inventory_optics_category ON inventory_items(optics_category);

-- Insert some sample optics data for testing
INSERT INTO inventory_items (
    name, description, sku, unit_price, quantity_in_stock, minimum_stock_level,
    unit_of_measure, is_active, category_id, optics_type, lens_power, lens_material,
    brand, model, color, optics_category, supplier_name
) VALUES
-- Sample lenses
('Single Vision Lens -2.00', 'Standard single vision lens for myopia correction', 'LENS-SV-200', 2500.00, 50, 10, 'piece', true, (SELECT id FROM inventory_categories WHERE name = 'Eye Glasses'), 'LENS', '-2.00', 'Plastic', 'VisionCare', 'Standard SV', 'Clear', 'SINGLE_VISION', 'Optics Supplier Inc.'),
('Progressive Lens +1.50', 'Progressive lens for presbyopia correction', 'LENS-PRO-150', 4500.00, 30, 5, 'piece', true, (SELECT id FROM inventory_categories WHERE name = 'Eye Glasses'), 'LENS', '+1.50', 'Polycarbonate', 'VisionCare', 'Premium Pro', 'Clear', 'PROGRESSIVE', 'Optics Supplier Inc.'),
('Bifocal Lens -1.00/+2.00', 'Bifocal lens for distance and near vision', 'LENS-BI-100-200', 3500.00, 25, 5, 'piece', true, (SELECT id FROM inventory_categories WHERE name = 'Eye Glasses'), 'LENS', '-1.00/+2.00', 'Plastic', 'VisionCare', 'Comfort Bi', 'Clear', 'BIFOCAL', 'Optics Supplier Inc.'),

-- Sample frames
('Metal Frame Medium', 'Classic metal frame for prescription glasses', 'FRAME-M-MED', 1200.00, 20, 5, 'piece', true, (SELECT id FROM inventory_categories WHERE name = 'Eye Glasses'), 'FRAME', NULL, NULL, 'VisionCare', 'Classic Metal', 'Gold', 'FRAME', 'Frame Supplier Ltd.'),
('Plastic Frame Large', 'Comfortable plastic frame for all-day wear', 'FRAME-P-LRG', 800.00, 35, 8, 'piece', true, (SELECT id FROM inventory_categories WHERE name = 'Eye Glasses'), 'FRAME', NULL, NULL, 'VisionCare', 'Comfort Plus', 'Black', 'FRAME', 'Frame Supplier Ltd.'),
('Titanium Frame Small', 'Lightweight titanium frame for active lifestyles', 'FRAME-T-SML', 2000.00, 15, 3, 'piece', true, (SELECT id FROM inventory_categories WHERE name = 'Eye Glasses'), 'FRAME', NULL, NULL, 'VisionCare', 'Active Ti', 'Silver', 'FRAME', 'Premium Frames Inc.')

ON CONFLICT (sku) DO NOTHING;

