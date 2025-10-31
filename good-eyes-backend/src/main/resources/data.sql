-- Optimized SQL Initialization for iSante Backend
-- This file uses batch operations and conditional inserts for better performance

-- Initialize default roles with batch insert
INSERT INTO roles (name, description, enabled) 
VALUES 
    ('USER', 'Default user role', true),
    ('ADMIN', 'Administrator role', true),
    ('SUPER_ADMIN', 'Super administrator role with full permissions', true)
ON CONFLICT (name) DO NOTHING;

-- Initialize default permissions with batch insert
INSERT INTO permissions (name, description, resource_name, action_name, enabled) 
VALUES 
    ('USER_READ', 'Read user information', 'USER', 'READ', true),
    ('USER_CREATE', 'Create new users', 'USER', 'CREATE', true),
    ('USER_UPDATE', 'Update user information', 'USER', 'UPDATE', true),
    ('USER_DELETE', 'Delete users', 'USER', 'DELETE', true),
    ('ROLE_READ', 'Read role information', 'ROLE', 'READ', true),
    ('ROLE_CREATE', 'Create new roles', 'ROLE', 'CREATE', true),
    ('ROLE_UPDATE', 'Update role information', 'ROLE', 'UPDATE', true),
    ('ROLE_DELETE', 'Delete roles', 'ROLE', 'DELETE', true),
    ('PERMISSION_READ', 'Read permission information', 'PERMISSION', 'READ', true),
    ('PERMISSION_CREATE', 'Create new permissions', 'PERMISSION', 'CREATE', true),
    ('PERMISSION_UPDATE', 'Update permission information', 'PERMISSION', 'UPDATE', true),
    ('PERMISSION_DELETE', 'Delete permissions', 'PERMISSION', 'DELETE', true)
ON CONFLICT (name) DO NOTHING; 