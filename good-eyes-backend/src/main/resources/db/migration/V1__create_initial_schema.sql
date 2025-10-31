-- Initial database schema creation
-- This migration creates the basic tables needed for the application

-- Create departments table first (referenced by users)
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource_name VARCHAR(100),
    action_name VARCHAR(100),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create users table (after departments, roles, permissions)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    department_id BIGINT REFERENCES departments(id),
    enabled BOOLEAN NOT NULL DEFAULT true,
    password_change_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create user_roles junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system',
    UNIQUE(user_id, role_id)
);

-- Create role_permissions junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system',
    UNIQUE(role_id, permission_id)
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id BIGSERIAL PRIMARY KEY,
    patient_number VARCHAR(20) UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create appointment_types table
CREATE TABLE IF NOT EXISTS appointment_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    default_duration INTEGER NOT NULL,
    default_cost DECIMAL(10,2) NOT NULL,
    requires_insurance BOOLEAN DEFAULT false,
    requires_prepayment BOOLEAN DEFAULT false,
    requires_consultation BOOLEAN DEFAULT false,
    max_advance_booking_days INTEGER DEFAULT 30,
    min_notice_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    appointment_type_id BIGINT REFERENCES appointment_types(id),
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    patient_name VARCHAR(100) NOT NULL,
    patient_phone VARCHAR(20),
    patient_email VARCHAR(100),
    user_id BIGINT REFERENCES users(id),
    doctor_name VARCHAR(100) NOT NULL,
    doctor_specialty VARCHAR(100),
    appointment_id BIGINT REFERENCES appointments(id),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_method VARCHAR(20),
    payment_reference VARCHAR(100),
    payment_date TIMESTAMP,
    insurance_provider VARCHAR(100),
    insurance_number VARCHAR(50),
    insurance_coverage DECIMAL(5,2),
    insurance_amount DECIMAL(10,2),
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create patient_visit_sessions table
CREATE TABLE IF NOT EXISTS patient_visit_sessions (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create basic_refraction_exams table
CREATE TABLE IF NOT EXISTS basic_refraction_exams (
    id BIGSERIAL PRIMARY KEY,
    visit_session_id BIGINT NOT NULL REFERENCES patient_visit_sessions(id),
    
    -- Neuro/Psych Section
    neuro_oriented BOOLEAN,
    neuro_mood VARCHAR(100),
    
    -- Pupils Section
    pupils_perrl BOOLEAN,
    pupils_right_dark VARCHAR(50),
    pupils_right_light VARCHAR(50),
    pupils_right_shape VARCHAR(50),
    pupils_right_react VARCHAR(50),
    pupils_right_apd VARCHAR(50),
    pupils_left_dark VARCHAR(50),
    pupils_left_light VARCHAR(50),
    pupils_left_shape VARCHAR(50),
    pupils_left_react VARCHAR(50),
    pupils_left_apd VARCHAR(50),
    
    -- Visual Acuity Section
    visual_acuity_distance_sc_right VARCHAR(20),
    visual_acuity_distance_ph_right VARCHAR(20),
    visual_acuity_distance_cc_right VARCHAR(20),
    visual_acuity_distance_sc_left VARCHAR(20),
    visual_acuity_distance_ph_left VARCHAR(20),
    visual_acuity_distance_cc_left VARCHAR(20),
    visual_acuity_near_sc_right VARCHAR(20),
    visual_acuity_near_cc_right VARCHAR(20),
    visual_acuity_near_sc_left VARCHAR(20),
    visual_acuity_near_cc_left VARCHAR(20),
    
    -- Refraction Section
    manifest_auto_right_sphere DOUBLE PRECISION,
    manifest_auto_right_cylinder DOUBLE PRECISION,
    manifest_auto_right_axis INTEGER,
    manifest_auto_left_sphere DOUBLE PRECISION,
    manifest_auto_left_cylinder DOUBLE PRECISION,
    manifest_auto_left_axis INTEGER,
    keratometry_k1_right DOUBLE PRECISION,
    keratometry_k2_right DOUBLE PRECISION,
    keratometry_axis_right INTEGER,
    keratometry_k1_left DOUBLE PRECISION,
    keratometry_k2_left DOUBLE PRECISION,
    keratometry_axis_left INTEGER,
    manifest_ret_right_sphere DOUBLE PRECISION,
    manifest_ret_right_cylinder DOUBLE PRECISION,
    manifest_ret_right_axis INTEGER,
    manifest_ret_left_sphere DOUBLE PRECISION,
    manifest_ret_left_cylinder DOUBLE PRECISION,
    manifest_ret_left_axis INTEGER,
    subjective_right_sphere DOUBLE PRECISION,
    subjective_right_cylinder DOUBLE PRECISION,
    subjective_right_axis INTEGER,
    subjective_left_sphere DOUBLE PRECISION,
    subjective_left_cylinder DOUBLE PRECISION,
    subjective_left_axis INTEGER,
    added_values VARCHAR(100),
    best_right_vision VARCHAR(20),
    best_left_vision VARCHAR(20),
    pd_right_eye DOUBLE PRECISION,
    pd_left_eye DOUBLE PRECISION,
    comment TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create main_examinations table
CREATE TABLE IF NOT EXISTS main_examinations (
    id BIGSERIAL PRIMARY KEY,
    visit_session_id BIGINT NOT NULL REFERENCES patient_visit_sessions(id),
    
    -- External Examination
    external_right TEXT,
    external_left TEXT,
    
    -- CDR (Cup-to-Disc Ratio)
    cdr_right DECIMAL(3,1),
    cdr_left DECIMAL(3,1),
    
    -- IOP (Intraocular Pressure)
    iop_right INTEGER,
    iop_left INTEGER,
    
    -- Notes and Comments
    advice TEXT,
    history_comments TEXT,
    doctors_notes TEXT,
    time_completed TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system',
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_patient_number ON patients(patient_number);
CREATE INDEX IF NOT EXISTS idx_patient_visit_sessions_patient_id ON patient_visit_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_basic_refraction_exams_visit_session_id ON basic_refraction_exams(visit_session_id);
CREATE INDEX IF NOT EXISTS idx_main_examinations_visit_session_id ON main_examinations(visit_session_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
