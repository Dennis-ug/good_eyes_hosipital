-- Migration V67: Add store column to consumable_items table
-- This migration adds a store column to the consumable_items table with a default value of 'General Store'

ALTER TABLE consumable_items
ADD COLUMN store VARCHAR(100) DEFAULT 'General Store' NOT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN consumable_items.store IS 'The store or warehouse where the consumable item is located';

-- Create an index for better query performance on the store column
CREATE INDEX idx_consumable_items_store ON consumable_items(store);

-- Update any existing records to have the default value (though ALTER TABLE with DEFAULT should handle this)
UPDATE consumable_items
SET store = 'General Store'
WHERE store IS NULL OR store = '';

