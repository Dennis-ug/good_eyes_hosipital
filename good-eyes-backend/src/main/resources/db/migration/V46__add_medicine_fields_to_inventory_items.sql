-- Add optional medicine fields to inventory_items to support drugs and non-drug products
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS generic_name VARCHAR(200);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS dosage_form VARCHAR(50);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS strength VARCHAR(50);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS active_ingredient VARCHAR(200);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS controlled_substance BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS storage_conditions VARCHAR(255);


