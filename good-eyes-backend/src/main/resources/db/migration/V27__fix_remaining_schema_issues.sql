-- Fix remaining schema issues for appointments and inventory tables

-- 1. Fix appointments table - add missing appointment_type column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50);

-- 2. Fix inventory_items table - add missing columns that the entity expects
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS active_ingredient VARCHAR(200);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS batch_number VARCHAR(50);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS controlled_substance BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS dosage_form VARCHAR(50);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS generic_name VARCHAR(200);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS maximum_stock_level INTEGER;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS minimum_stock_level INTEGER;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS quantity_in_stock INTEGER DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reorder_point INTEGER;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS storage_conditions VARCHAR(200);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS strength VARCHAR(50);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS supplier_contact VARCHAR(100);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(100);

-- 3. Fix inventory_drugs table - add missing columns
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS active_ingredient VARCHAR(200);
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS batch_number VARCHAR(50);
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS controlled_substance BOOLEAN DEFAULT false;
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS maximum_stock_level INTEGER;
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS minimum_stock_level INTEGER;
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS quantity_in_stock INTEGER DEFAULT 0;
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS reorder_point INTEGER;
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER;
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN DEFAULT false;
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS storage_conditions VARCHAR(200);
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS supplier_contact VARCHAR(100);
ALTER TABLE inventory_drugs ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(100);

-- 4. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_type ON appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_batch_number ON inventory_items(batch_number);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_drugs_batch_number ON inventory_drugs(batch_number);
CREATE INDEX IF NOT EXISTS idx_inventory_drugs_expiry_date ON inventory_drugs(expiry_date);
