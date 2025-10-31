-- Migration V69: Create Theater Requisitions System
-- This migration creates the complete theater requisition workflow system

-- Theater Requisitions Table
CREATE TABLE theater_requisitions (
    id SERIAL PRIMARY KEY,
    requisition_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    requested_by_user_id INTEGER REFERENCES users(id) NOT NULL,
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    required_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED, FULFILLED, CANCELLED
    priority VARCHAR(10) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    department_id INTEGER REFERENCES departments(id),
    patient_procedure_id INTEGER REFERENCES patient_procedures(id), -- Optional: link to specific procedure
    approved_by_user_id INTEGER REFERENCES users(id),
    approved_date TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Theater Requisition Items Table
CREATE TABLE theater_requisition_items (
    id SERIAL PRIMARY KEY,
    requisition_id INTEGER REFERENCES theater_requisitions(id) ON DELETE CASCADE,
    consumable_item_id INTEGER REFERENCES consumable_items(id) NOT NULL,
    quantity_requested DECIMAL(10,2) NOT NULL,
    quantity_approved DECIMAL(10,2) DEFAULT 0,
    quantity_fulfilled DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    purpose VARCHAR(100), -- surgery, emergency, maintenance, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Theater Store Transfers Table (tracks stock movements from general store to theater stores)
CREATE TABLE theater_store_transfers (
    id SERIAL PRIMARY KEY,
    requisition_id INTEGER REFERENCES theater_requisitions(id),
    from_store VARCHAR(100) NOT NULL DEFAULT 'General Store',
    to_theater_store_id INTEGER,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transferred_by_user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED, CANCELLED
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Theater Store Transfer Items Table
CREATE TABLE theater_store_transfer_items (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER REFERENCES theater_store_transfers(id) ON DELETE CASCADE,
    consumable_item_id INTEGER REFERENCES consumable_items(id) NOT NULL,
    quantity_transferred DECIMAL(10,2) NOT NULL,
    batch_number VARCHAR(50),
    expiry_date DATE,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Theater Procedure Usage Table (surgeon records actual usage during procedures)
CREATE TABLE theater_procedure_usage (
    id SERIAL PRIMARY KEY,
    patient_procedure_id INTEGER REFERENCES patient_procedures(id) NOT NULL,
    consumable_item_id INTEGER REFERENCES consumable_items(id) NOT NULL,
    theater_store_id INTEGER,
    quantity_used DECIMAL(10,2) NOT NULL,
    used_by_user_id INTEGER REFERENCES users(id) NOT NULL,
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    batch_number VARCHAR(50),
    purpose VARCHAR(100), -- actual surgical use, emergency, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_theater_requisitions_status ON theater_requisitions(status);
CREATE INDEX idx_theater_requisitions_requested_by ON theater_requisitions(requested_by_user_id);
CREATE INDEX idx_theater_requisitions_approved_by ON theater_requisitions(approved_by_user_id);
CREATE INDEX idx_theater_requisitions_date ON theater_requisitions(requested_date);
CREATE INDEX idx_theater_requisitions_procedure ON theater_requisitions(patient_procedure_id);

CREATE INDEX idx_theater_requisition_items_requisition ON theater_requisition_items(requisition_id);
CREATE INDEX idx_theater_requisition_items_consumable ON theater_requisition_items(consumable_item_id);

CREATE INDEX idx_theater_store_transfers_requisition ON theater_store_transfers(requisition_id);
CREATE INDEX idx_theater_store_transfers_status ON theater_store_transfers(status);

CREATE INDEX idx_theater_store_transfer_items_transfer ON theater_store_transfer_items(transfer_id);
CREATE INDEX idx_theater_store_transfer_items_consumable ON theater_store_transfer_items(consumable_item_id);

CREATE INDEX idx_theater_procedure_usage_procedure ON theater_procedure_usage(patient_procedure_id);
CREATE INDEX idx_theater_procedure_usage_consumable ON theater_procedure_usage(consumable_item_id);
CREATE INDEX idx_theater_procedure_usage_date ON theater_procedure_usage(usage_date);

-- Create sequence for requisition numbers
CREATE SEQUENCE theater_requisition_number_seq START 1;

-- Create function to generate requisition numbers
CREATE OR REPLACE FUNCTION generate_theater_requisition_number()
RETURNS VARCHAR AS $$
DECLARE
    next_number BIGINT;
    result VARCHAR;
BEGIN
    -- Get and increment the current number atomically
    SELECT nextval('theater_requisition_number_seq') INTO next_number;
    
    -- Format the result
    result := 'TR-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE theater_requisitions IS 'Theater requisitions for consumable items needed for surgical procedures';
COMMENT ON TABLE theater_requisition_items IS 'Individual items requested in theater requisitions';
COMMENT ON TABLE theater_store_transfers IS 'Tracks stock transfers from general store to theater stores';
COMMENT ON TABLE theater_store_transfer_items IS 'Individual items transferred to theater stores';
COMMENT ON TABLE theater_procedure_usage IS 'Records actual usage of consumables during surgical procedures';

COMMENT ON COLUMN theater_requisitions.status IS 'DRAFT, SUBMITTED, APPROVED, REJECTED, FULFILLED, CANCELLED';
COMMENT ON COLUMN theater_requisitions.priority IS 'LOW, MEDIUM, HIGH, URGENT';
COMMENT ON COLUMN theater_store_transfers.status IS 'PENDING, COMPLETED, CANCELLED';
