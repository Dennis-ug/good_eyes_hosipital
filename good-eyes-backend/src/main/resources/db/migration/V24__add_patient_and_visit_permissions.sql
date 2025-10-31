-- Migration V24: Add patient and visit session permissions with proper role assignments
-- This migration adds granular permissions for patient and visit management

-- Add patient-related permissions
INSERT INTO permissions (name, description, resource_name, action_name, enabled, created_at, updated_at) 
VALUES 
    ('PATIENT_READ', 'Read patient information', 'PATIENT', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PATIENT_CREATE', 'Create new patients', 'PATIENT', 'CREATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PATIENT_UPDATE', 'Update patient information', 'PATIENT', 'UPDATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PATIENT_DELETE', 'Delete patients', 'PATIENT', 'DELETE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VISIT_SESSION_READ', 'Read visit session information', 'VISIT_SESSION', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VISIT_SESSION_CREATE', 'Create new visit sessions', 'VISIT_SESSION', 'CREATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VISIT_SESSION_UPDATE', 'Update visit session information', 'VISIT_SESSION', 'UPDATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('VISIT_SESSION_DELETE', 'Delete visit sessions', 'VISIT_SESSION', 'DELETE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('EXAMINATION_READ', 'Read examination information', 'EXAMINATION', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('EXAMINATION_CREATE', 'Create new examinations', 'EXAMINATION', 'CREATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('EXAMINATION_UPDATE', 'Update examination information', 'EXAMINATION', 'UPDATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('EXAMINATION_DELETE', 'Delete examinations', 'EXAMINATION', 'DELETE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRIAGE_READ', 'Read triage information', 'TRIAGE', 'READ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRIAGE_CREATE', 'Create new triage records', 'TRIAGE', 'CREATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRIAGE_UPDATE', 'Update triage information', 'TRIAGE', 'UPDATE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TRIAGE_DELETE', 'Delete triage records', 'TRIAGE', 'DELETE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Add missing roles if they don't exist
INSERT INTO roles (name, description, enabled, created_at, updated_at) 
VALUES 
    ('RECEPTIONIST', 'Receptionist role for patient registration', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('OPTOMETRIST', 'Optometrist role for eye examinations', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('OPHTHALMOLOGIST', 'Ophthalmologist role for medical eye care', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DOCTOR', 'General doctor role for medical practitioners', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- SUPER_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_by)
SELECT r.id, p.id, CURRENT_TIMESTAMP, 'system', 'system'
FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ADMIN gets all permissions except user/role/permission management
INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_by)
SELECT r.id, p.id, CURRENT_TIMESTAMP, 'system', 'system'
FROM roles r, permissions p
WHERE r.name = 'ADMIN' 
  AND p.name NOT IN ('USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'PERMISSION_CREATE', 'PERMISSION_UPDATE', 'PERMISSION_DELETE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- RECEPTIONIST gets patient and visit session permissions
INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_by)
SELECT r.id, p.id, CURRENT_TIMESTAMP, 'system', 'system'
FROM roles r, permissions p
WHERE r.name = 'RECEPTIONIST' 
  AND p.name IN ('PATIENT_READ', 'PATIENT_CREATE', 'PATIENT_UPDATE', 'VISIT_SESSION_READ', 'VISIT_SESSION_CREATE', 'VISIT_SESSION_UPDATE', 'EXAMINATION_READ', 'TRIAGE_READ')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- DOCTOR gets clinical permissions but NOT patient/visit creation
INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_by)
SELECT r.id, p.id, CURRENT_TIMESTAMP, 'system', 'system'
FROM roles r, permissions p
WHERE r.name = 'DOCTOR' 
  AND p.name IN ('PATIENT_READ', 'PATIENT_UPDATE', 'VISIT_SESSION_READ', 'VISIT_SESSION_UPDATE', 'EXAMINATION_READ', 'EXAMINATION_CREATE', 'EXAMINATION_UPDATE', 'TRIAGE_READ', 'TRIAGE_CREATE', 'TRIAGE_UPDATE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- OPTOMETRIST gets clinical permissions but NOT patient/visit creation
INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_by)
SELECT r.id, p.id, CURRENT_TIMESTAMP, 'system', 'system'
FROM roles r, permissions p
WHERE r.name = 'OPTOMETRIST' 
  AND p.name IN ('PATIENT_READ', 'PATIENT_UPDATE', 'VISIT_SESSION_READ', 'VISIT_SESSION_UPDATE', 'EXAMINATION_READ', 'EXAMINATION_CREATE', 'EXAMINATION_UPDATE', 'TRIAGE_READ', 'TRIAGE_CREATE', 'TRIAGE_UPDATE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- OPHTHALMOLOGIST gets clinical permissions but NOT patient/visit creation
INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_by)
SELECT r.id, p.id, CURRENT_TIMESTAMP, 'system', 'system'
FROM roles r, permissions p
WHERE r.name = 'OPHTHALMOLOGIST' 
  AND p.name IN ('PATIENT_READ', 'PATIENT_UPDATE', 'VISIT_SESSION_READ', 'VISIT_SESSION_UPDATE', 'EXAMINATION_READ', 'EXAMINATION_CREATE', 'EXAMINATION_UPDATE', 'TRIAGE_READ', 'TRIAGE_CREATE', 'TRIAGE_UPDATE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- USER gets basic read permissions
INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_by)
SELECT r.id, p.id, CURRENT_TIMESTAMP, 'system', 'system'
FROM roles r, permissions p
WHERE r.name = 'USER' 
  AND p.name IN ('PATIENT_READ', 'VISIT_SESSION_READ', 'EXAMINATION_READ', 'TRIAGE_READ')
ON CONFLICT (role_id, permission_id) DO NOTHING;
