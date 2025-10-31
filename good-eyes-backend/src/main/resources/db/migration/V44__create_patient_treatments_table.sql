-- Create patient_treatments table
CREATE TABLE IF NOT EXISTS patient_treatments (
    id BIGSERIAL PRIMARY KEY,
    visit_session_id BIGINT NOT NULL REFERENCES patient_visit_sessions(id) ON DELETE CASCADE,
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    item_name VARCHAR(255) NOT NULL,
    sku VARCHAR(128),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_patient_treatments_visit_session ON patient_treatments(visit_session_id);


