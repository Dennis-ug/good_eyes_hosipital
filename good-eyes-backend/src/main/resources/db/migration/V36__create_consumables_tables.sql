-- Migration V36: Create Consumables Management Tables
-- This migration creates tables for managing hospital consumables (internal use items)

-- Consumables Category Table
CREATE TABLE consumable_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consumables Items Table
CREATE TABLE consumable_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES consumable_categories(id),
    sku VARCHAR(50) UNIQUE,
    unit_of_measure VARCHAR(20) NOT NULL, -- pieces, boxes, liters, etc.
    current_stock DECIMAL(10,2) DEFAULT 0,
    minimum_stock_level DECIMAL(10,2) DEFAULT 0,
    maximum_stock_level DECIMAL(10,2) DEFAULT 0,
    reorder_point DECIMAL(10,2) DEFAULT 0,
    reorder_quantity DECIMAL(10,2) DEFAULT 0,
    supplier_name VARCHAR(200),
    supplier_contact VARCHAR(100),
    cost_per_unit DECIMAL(10,2),
    location VARCHAR(100), -- storage location
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consumables Usage/Consumption Table
CREATE TABLE consumable_usage (
    id SERIAL PRIMARY KEY,
    consumable_item_id INTEGER REFERENCES consumable_items(id),
    quantity_used DECIMAL(10,2) NOT NULL,
    used_by_user_id INTEGER REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    purpose VARCHAR(100), -- surgery, cleaning, maintenance, etc.
    patient_id INTEGER REFERENCES patients(id), -- optional, for patient-specific usage
    visit_session_id INTEGER REFERENCES patient_visit_sessions(id), -- optional
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consumables Restock Table
CREATE TABLE consumable_restock (
    id SERIAL PRIMARY KEY,
    consumable_item_id INTEGER REFERENCES consumable_items(id),
    quantity_added DECIMAL(10,2) NOT NULL,
    restock_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    restocked_by_user_id INTEGER REFERENCES users(id),
    supplier_name VARCHAR(200),
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    invoice_number VARCHAR(50),
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_consumable_items_category_id ON consumable_items(category_id);
CREATE INDEX idx_consumable_items_is_active ON consumable_items(is_active);
CREATE INDEX idx_consumable_usage_item_id ON consumable_usage(consumable_item_id);
CREATE INDEX idx_consumable_usage_date ON consumable_usage(usage_date);
CREATE INDEX idx_consumable_usage_department_id ON consumable_usage(department_id);
CREATE INDEX idx_consumable_restock_item_id ON consumable_restock(consumable_item_id);
CREATE INDEX idx_consumable_restock_date ON consumable_restock(restock_date);

-- Ensure a default department exists and seed categories referencing it
DO $$
DECLARE
    v_dept_id BIGINT;
BEGIN
    -- Create a default department if none exist
    IF NOT EXISTS (SELECT 1 FROM departments) THEN
        INSERT INTO departments (name, description, enabled)
        VALUES ('General', 'Default department for consumables', true);
    END IF;

    -- Pick any existing department id (prefer the newly created one if applicable)
    SELECT id INTO v_dept_id FROM departments ORDER BY id ASC LIMIT 1;

    -- Insert categories if they do not already exist (by name)
    INSERT INTO consumable_categories (name, description, department_id, is_active)
    VALUES ('Surgical Supplies', 'Items used during surgical procedures', v_dept_id, true)
    ON CONFLICT DO NOTHING;

    INSERT INTO consumable_categories (name, description, department_id, is_active)
    VALUES ('Cleaning Supplies', 'Cleaning and sanitization materials', v_dept_id, true)
    ON CONFLICT DO NOTHING;

    INSERT INTO consumable_categories (name, description, department_id, is_active)
    VALUES ('Medical Equipment', 'Medical devices and equipment', v_dept_id, true)
    ON CONFLICT DO NOTHING;

    INSERT INTO consumable_categories (name, description, department_id, is_active)
    VALUES ('Office Supplies', 'General office and administrative supplies', v_dept_id, true)
    ON CONFLICT DO NOTHING;

    INSERT INTO consumable_categories (name, description, department_id, is_active)
    VALUES ('Laboratory Supplies', 'Lab testing and diagnostic materials', v_dept_id, true)
    ON CONFLICT DO NOTHING;
END $$;
