-- Add missing columns to invoice_items table to match the entity

-- Add item_description column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_description TEXT;

-- Add item_type column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) NOT NULL DEFAULT 'CONSULTATION';

-- Add discount_percentage column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2);

-- Add discount_amount column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2);

-- Add final_price column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS final_price NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Add tax_percentage column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC(5,2);

-- Add tax_amount column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2);

-- Add insurance_covered column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS insurance_covered BOOLEAN DEFAULT FALSE;

-- Add insurance_coverage_percentage column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS insurance_coverage_percentage NUMERIC(5,2);

-- Add insurance_amount column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS insurance_amount NUMERIC(10,2);

-- Add notes column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add inventory_item_id column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS inventory_item_id BIGINT;

-- Add sku column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

-- Add foreign key constraint for inventory_item_id (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_invoice_items_inventory_item' 
        AND table_name = 'invoice_items'
    ) THEN
        ALTER TABLE invoice_items ADD CONSTRAINT fk_invoice_items_inventory_item 
            FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update existing records to set final_price equal to total_price
UPDATE invoice_items SET final_price = total_price WHERE final_price IS NULL OR final_price = 0;

-- Create index for inventory_item_id
CREATE INDEX IF NOT EXISTS idx_invoice_items_inventory_item_id ON invoice_items(inventory_item_id);

-- Create index for item_type
CREATE INDEX IF NOT EXISTS idx_invoice_items_item_type ON invoice_items(item_type);
