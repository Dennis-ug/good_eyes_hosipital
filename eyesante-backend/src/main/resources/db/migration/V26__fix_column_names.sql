-- Fix column name mismatches between database schema and JPA entities

-- 1. Fix patients table column names
-- Rename phone_number to phone to match the entity
ALTER TABLE patients RENAME COLUMN phone_number TO phone;

-- 2. Fix appointments table - add missing columns that might not have been added
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TIME;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS actual_duration INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id BIGINT REFERENCES users(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_specialty VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_email VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_phone VARCHAR(20);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS priority VARCHAR(20);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 3. Ensure all required columns exist in patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);

-- 4. Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS eye_examinations (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    examiner_id BIGINT REFERENCES users(id),
    examiner_name VARCHAR(100),
    examination_date TIMESTAMP NOT NULL,
    chief_complaint TEXT,
    eye_history TEXT,
    family_eye_history TEXT,
    visual_acuity_right VARCHAR(20),
    visual_acuity_left VARCHAR(20),
    intraocular_pressure_right INTEGER,
    intraocular_pressure_left INTEGER,
    refraction_right VARCHAR(50),
    refraction_left VARCHAR(50),
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    next_appointment DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    doctor_name VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS triage_measurements (
    id BIGSERIAL PRIMARY KEY,
    visit_session_id BIGINT NOT NULL REFERENCES patient_visit_sessions(id),
    measured_by VARCHAR(100),
    measurement_date TIMESTAMP NOT NULL,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    weight_kg DECIMAL(5,2),
    weight_lbs DECIMAL(5,2),
    iop_right INTEGER,
    iop_left INTEGER,
    rbs_value DECIMAL(5,2),
    rbs_unit VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS inventory_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES inventory_categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    unit_price DECIMAL(10,2) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    unit_of_measure VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS inventory_drugs (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES inventory_categories(id),
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    unit_price DECIMAL(10,2) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    unit_of_measure VARCHAR(20),
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    manufacturer VARCHAR(100),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- 5. Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_eye_examinations_patient_id ON eye_examinations(patient_id);
CREATE INDEX IF NOT EXISTS idx_eye_examinations_examiner_id ON eye_examinations(examiner_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_triage_measurements_visit_session_id ON triage_measurements(visit_session_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_drugs_category_id ON inventory_drugs(category_id);
