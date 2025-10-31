-- Migration V35: Add ACCOUNT_STORE_MANAGER role and update existing roles
-- This migration adds the new ACCOUNT_STORE_MANAGER role and ensures all roles exist

-- Add missing roles that should exist in the system
INSERT INTO roles (name, description, created_at, updated_at) 
VALUES 
    ('RECEPTIONIST', 'Receptionist role for patient registration and visit management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DOCTOR', 'Doctor role for medical examinations and patient care', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('OPHTHALMOLOGIST', 'Ophthalmologist role for specialized eye care', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('OPTOMETRIST', 'Optometrist role for eye examinations and vision care', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ACCOUNTANT', 'Accountant role for financial management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ACCOUNT_STORE_MANAGER', 'Account and Store Manager role for financial and inventory management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Add additional permissions that might be needed
INSERT INTO permissions (name, description, created_at, updated_at) 
VALUES 
    ('PATIENT_READ', 'Read patient information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PATIENT_CREATE', 'Create new patients', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PATIENT_UPDATE', 'Update patient information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PATIENT_DELETE', 'Delete patients', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VISIT_SESSION_READ', 'Read visit session information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VISIT_SESSION_CREATE', 'Create new visit sessions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VISIT_SESSION_UPDATE', 'Update visit session information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VISIT_SESSION_DELETE', 'Delete visit sessions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('EXAMINATION_READ', 'Read examination information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('EXAMINATION_CREATE', 'Create new examinations', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('EXAMINATION_UPDATE', 'Update examination information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('EXAMINATION_DELETE', 'Delete examinations', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRIAGE_READ', 'Read triage information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRIAGE_CREATE', 'Create new triage measurements', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRIAGE_UPDATE', 'Update triage information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRIAGE_DELETE', 'Delete triage measurements', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FINANCE_READ', 'Read financial information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FINANCE_CREATE', 'Create financial records', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FINANCE_UPDATE', 'Update financial records', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FINANCE_DELETE', 'Delete financial records', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('INVENTORY_READ', 'Read inventory information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('INVENTORY_CREATE', 'Create inventory records', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('INVENTORY_UPDATE', 'Update inventory records', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('INVENTORY_DELETE', 'Delete inventory records', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('APPOINTMENT_READ', 'Read appointment information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('APPOINTMENT_CREATE', 'Create new appointments', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('APPOINTMENT_UPDATE', 'Update appointment information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('APPOINTMENT_DELETE', 'Delete appointments', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SCHEDULE_READ', 'Read schedule information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SCHEDULE_CREATE', 'Create new schedules', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SCHEDULE_UPDATE', 'Update schedule information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SCHEDULE_DELETE', 'Delete schedules', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
