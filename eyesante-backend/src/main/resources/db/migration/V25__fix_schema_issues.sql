-- Fix database schema issues
-- This migration adds missing columns and creates missing tables

-- 1. Fix patients table - add missing columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age_in_years INTEGER;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age_in_months INTEGER;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS national_id VARCHAR(15);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS religion VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS next_of_kin VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS next_of_kin_relationship VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS next_of_kin_phone VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS alternative_phone VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone_owner VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS owner_name VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_category VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS company VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS citizenship VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS country_id VARCHAR(10);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS foreigner_or_refugee VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS non_ugandan_national_id_no VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS residence TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS research_number VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS reception_timestamp TIMESTAMP;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS received_by VARCHAR(100);

-- 2. Fix appointments table - add missing columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS actual_duration INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TIME;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration INTEGER;
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

-- 3. Create eye_examinations table
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

-- 4. Create doctor_schedules table
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

-- 5. Create triage_measurements table
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

-- 6. Create inventory_categories table
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

-- 7. Create inventory_items table
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

-- 8. Create inventory_drugs table
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

-- 9. Fix patient_visit_sessions table - add missing columns
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS visit_purpose VARCHAR(100);
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50) DEFAULT 'RECEPTION';
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS consultation_fee_paid BOOLEAN DEFAULT false;
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS consultation_fee_amount DECIMAL(10,2);
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS chief_complaint TEXT;
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS previous_visit_id BIGINT;
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS emergency_level VARCHAR(20);
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS requires_triage BOOLEAN DEFAULT false;
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS requires_doctor_visit BOOLEAN DEFAULT false;
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT false;
ALTER TABLE patient_visit_sessions ADD COLUMN IF NOT EXISTS invoice_id BIGINT REFERENCES invoices(id);

-- 10. Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_eye_examinations_patient_id ON eye_examinations(patient_id);
CREATE INDEX IF NOT EXISTS idx_eye_examinations_examiner_id ON eye_examinations(examiner_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_triage_measurements_visit_session_id ON triage_measurements(visit_session_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_drugs_category_id ON inventory_drugs(category_id);
CREATE INDEX IF NOT EXISTS idx_patient_visit_sessions_invoice_id ON patient_visit_sessions(invoice_id);

-- 11. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_patients_national_id ON patients(national_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patient_email);
