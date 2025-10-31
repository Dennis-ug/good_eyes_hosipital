-- Migration V20: Initialize default data with optimized batch operations
-- This migration uses batch inserts and conditional logic for better performance

-- Initialize default roles with batch insert
INSERT INTO roles (name, description, created_at, updated_at) 
VALUES 
    ('USER', 'Default user role', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ADMIN', 'Administrator role', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SUPER_ADMIN', 'Super administrator role with full permissions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Initialize default permissions with batch insert
INSERT INTO permissions (name, description, created_at, updated_at) 
VALUES 
    ('USER_READ', 'Read user information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_CREATE', 'Create new users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_UPDATE', 'Update user information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_DELETE', 'Delete users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ROLE_READ', 'Read role information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ROLE_CREATE', 'Create new roles', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ROLE_UPDATE', 'Update role information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ROLE_DELETE', 'Delete roles', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PERMISSION_READ', 'Read permission information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PERMISSION_CREATE', 'Create new permissions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PERMISSION_UPDATE', 'Update permission information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PERMISSION_DELETE', 'Delete permissions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
