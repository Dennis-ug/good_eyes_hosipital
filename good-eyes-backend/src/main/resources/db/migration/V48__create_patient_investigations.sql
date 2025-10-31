-- Ensure investigation_types table exists
CREATE TABLE IF NOT EXISTS investigation_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    normal_range VARCHAR(255),
    unit VARCHAR(64),
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100)
);

-- Optional: seed a few common investigations if table is empty
INSERT INTO investigation_types (name, normal_range, unit, description, price, created_by)
SELECT 'Full Blood Count (FBC)', NULL, NULL, 'Complete blood count', 15000.00, 'system'
WHERE NOT EXISTS (SELECT 1 FROM investigation_types LIMIT 1);

-- Create patient investigations linking to types
CREATE TABLE IF NOT EXISTS patient_investigations (
    id BIGSERIAL PRIMARY KEY,
    visit_session_id BIGINT NOT NULL,
    investigation_type_id BIGINT NOT NULL,
    eye_side VARCHAR(10),
    quantity INT DEFAULT 1,
    cost DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100),
    FOREIGN KEY (visit_session_id) REFERENCES patient_visit_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (investigation_type_id) REFERENCES investigation_types(id) ON DELETE RESTRICT
);


