-- Migration V68: Create Theater Stores Management
-- This migration creates tables for managing theater stores that hold consumables for surgical procedures

-- Theater Stores Table
CREATE TABLE IF NOT EXISTS theater_stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(200) NOT NULL, -- Physical location of the store
    store_type VARCHAR(50) NOT NULL DEFAULT 'SURGICAL', -- SURGICAL, EMERGENCY, STERILE, etc.
    capacity INTEGER, -- Maximum capacity of the store
    is_active BOOLEAN NOT NULL DEFAULT true,
    managed_by_user_id INTEGER REFERENCES users(id), -- User responsible for managing this store
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Theater Store Items Table (tracks inventory in theater stores)
CREATE TABLE IF NOT EXISTS theater_store_items (
    id SERIAL PRIMARY KEY,
    theater_store_id INTEGER REFERENCES theater_stores(id) ON DELETE CASCADE,
    consumable_item_id INTEGER REFERENCES consumable_items(id) ON DELETE CASCADE,
    quantity_available DECIMAL(10,2) NOT NULL DEFAULT 0,
    minimum_quantity DECIMAL(10,2) DEFAULT 0,
    maximum_quantity DECIMAL(10,2) DEFAULT 0,
    last_restocked TIMESTAMP,
    expiry_date DATE,
    batch_number VARCHAR(50),
    is_sterile BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(theater_store_id, consumable_item_id, batch_number)
);

-- Theater Store Usage Table (tracks usage from theater stores)
CREATE TABLE IF NOT EXISTS theater_store_usage (
    id SERIAL PRIMARY KEY,
    theater_store_item_id INTEGER REFERENCES theater_store_items(id) ON DELETE CASCADE,
    patient_procedure_id INTEGER REFERENCES patient_procedures(id),
    quantity_used DECIMAL(10,2) NOT NULL,
    used_by_user_id INTEGER REFERENCES users(id),
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    purpose VARCHAR(100), -- surgical use, emergency, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_theater_stores_name ON theater_stores(name);
CREATE INDEX IF NOT EXISTS idx_theater_stores_location ON theater_stores(location);
CREATE INDEX IF NOT EXISTS idx_theater_stores_type ON theater_stores(store_type);
CREATE INDEX IF NOT EXISTS idx_theater_stores_active ON theater_stores(is_active);
CREATE INDEX IF NOT EXISTS idx_theater_stores_managed_by ON theater_stores(managed_by_user_id);

CREATE INDEX IF NOT EXISTS idx_theater_store_items_store ON theater_store_items(theater_store_id);
CREATE INDEX IF NOT EXISTS idx_theater_store_items_consumable ON theater_store_items(consumable_item_id);
CREATE INDEX IF NOT EXISTS idx_theater_store_items_active ON theater_store_items(is_active);
CREATE INDEX IF NOT EXISTS idx_theater_store_items_expiry ON theater_store_items(expiry_date);

CREATE INDEX IF NOT EXISTS idx_theater_store_usage_item ON theater_store_usage(theater_store_item_id);
CREATE INDEX IF NOT EXISTS idx_theater_store_usage_procedure ON theater_store_usage(patient_procedure_id);
CREATE INDEX IF NOT EXISTS idx_theater_store_usage_user ON theater_store_usage(used_by_user_id);
CREATE INDEX IF NOT EXISTS idx_theater_store_usage_date ON theater_store_usage(usage_date);

-- Note: Foreign key constraints will be added in a future migration if needed

-- Add comments for documentation
COMMENT ON TABLE theater_stores IS 'Physical stores/rooms where theater consumables are kept';
COMMENT ON TABLE theater_store_items IS 'Inventory items stored in theater stores with quantities and batch tracking';
COMMENT ON TABLE theater_store_usage IS 'Records of consumables used from theater stores during procedures';

COMMENT ON COLUMN theater_stores.store_type IS 'Type of theater store: SURGICAL, EMERGENCY, STERILE, etc.';
COMMENT ON COLUMN theater_store_items.is_sterile IS 'Whether the item is sterile and requires special handling';
COMMENT ON COLUMN theater_store_usage.purpose IS 'Purpose of usage: surgical, emergency, maintenance, etc.';

