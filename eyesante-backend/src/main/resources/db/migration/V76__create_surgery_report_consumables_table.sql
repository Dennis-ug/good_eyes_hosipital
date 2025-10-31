-- Migration V76: Create surgery_report_consumables table
-- This migration creates a table to track consumable items used in surgery reports

CREATE TABLE surgery_report_consumables (
    id BIGSERIAL PRIMARY KEY,
    surgery_report_id BIGINT NOT NULL,
    consumable_item_id BIGINT NOT NULL,
    quantity_used DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    CONSTRAINT fk_surgery_report_consumables_surgery_report 
        FOREIGN KEY (surgery_report_id) REFERENCES surgery_reports(id) ON DELETE CASCADE,
    CONSTRAINT fk_surgery_report_consumables_consumable_item 
        FOREIGN KEY (consumable_item_id) REFERENCES consumable_items(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_surgery_report_consumables_surgery_report_id ON surgery_report_consumables(surgery_report_id);
CREATE INDEX idx_surgery_report_consumables_consumable_item_id ON surgery_report_consumables(consumable_item_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_surgery_report_consumables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_surgery_report_consumables_updated_at
    BEFORE UPDATE ON surgery_report_consumables
    FOR EACH ROW
    EXECUTE FUNCTION update_surgery_report_consumables_updated_at();
