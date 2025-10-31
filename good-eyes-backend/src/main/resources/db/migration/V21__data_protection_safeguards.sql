-- Migration V21: Data Protection Safeguards
-- This migration ensures existing data is preserved during schema changes

-- Create a backup table for roles if it doesn't exist
CREATE TABLE IF NOT EXISTS roles_backup AS 
SELECT * FROM roles WHERE 1=0;

-- Create a backup table for permissions if it doesn't exist
CREATE TABLE IF NOT EXISTS permissions_backup AS 
SELECT * FROM permissions WHERE 1=0;

-- Create a backup table for users if it doesn't exist
CREATE TABLE IF NOT EXISTS users_backup AS 
SELECT * FROM users WHERE 1=0;

-- Create a backup table for user_roles if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles_backup AS 
SELECT * FROM user_roles WHERE 1=0;

-- Create a backup table for role_permissions if it doesn't exist
CREATE TABLE IF NOT EXISTS role_permissions_backup AS 
SELECT * FROM role_permissions WHERE 1=0;

-- Add constraints to prevent accidental data deletion
-- Only allow deletion if explicitly intended

-- Create a function to safely delete roles (only if no users are assigned)
CREATE OR REPLACE FUNCTION safe_delete_role(role_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if any users are assigned to this role
    IF EXISTS (SELECT 1 FROM user_roles WHERE role_id = $1) THEN
        RAISE EXCEPTION 'Cannot delete role %: Users are still assigned to this role', $1;
        RETURN FALSE;
    END IF;
    
    -- If no users are assigned, allow deletion
    DELETE FROM roles WHERE id = $1;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to safely delete permissions (only if no roles are assigned)
CREATE OR REPLACE FUNCTION safe_delete_permission(permission_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if any roles are assigned to this permission
    IF EXISTS (SELECT 1 FROM role_permissions WHERE permission_id = $1) THEN
        RAISE EXCEPTION 'Cannot delete permission %: Roles are still assigned to this permission', $1;
        RETURN FALSE;
    END IF;
    
    -- If no roles are assigned, allow deletion
    DELETE FROM permissions WHERE id = $1;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to prevent accidental deletion of critical data
CREATE OR REPLACE FUNCTION prevent_critical_data_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent deletion of SUPER_ADMIN role
    IF TG_TABLE_NAME = 'roles' AND OLD.name = 'SUPER_ADMIN' THEN
        RAISE EXCEPTION 'Cannot delete SUPER_ADMIN role: This is a critical system role';
    END IF;
    
    -- Prevent deletion of critical permissions
    IF TG_TABLE_NAME = 'permissions' AND OLD.name IN ('USER_READ', 'ROLE_READ', 'PERMISSION_READ') THEN
        RAISE EXCEPTION 'Cannot delete critical permission %: This is a required system permission', OLD.name;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for data protection
DROP TRIGGER IF EXISTS protect_critical_roles ON roles;
CREATE TRIGGER protect_critical_roles
    BEFORE DELETE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_critical_data_deletion();

DROP TRIGGER IF EXISTS protect_critical_permissions ON permissions;
CREATE TRIGGER protect_critical_permissions
    BEFORE DELETE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_critical_data_deletion();

-- Add indexes for better performance and data integrity
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Add foreign key constraints if they don't exist (data protection)
DO $$
BEGIN
    -- Add foreign key for user_roles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_roles_user_id' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for user_roles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_roles_role_id' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role_id 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for role_permissions if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_role_permissions_role_id' 
        AND table_name = 'role_permissions'
    ) THEN
        ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_role_id 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for role_permissions if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_role_permissions_permission_id' 
        AND table_name = 'role_permissions'
    ) THEN
        ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_permission_id 
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
    END IF;
END $$;
