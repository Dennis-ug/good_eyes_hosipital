-- Create SUPER_ADMIN role if it doesn't exist
INSERT INTO roles (name, description, enabled) 
VALUES ('SUPER_ADMIN', 'Super administrator role with full permissions', true)
ON CONFLICT (name) DO NOTHING;

-- Create super admin user if it doesn't exist
INSERT INTO users (username, email, password, first_name, last_name, enabled, password_change_required)
VALUES (
    'superadmin',
    'superadmin@eyesante.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- This is 'superadmin123' encoded with BCrypt
    'Super',
    'Admin',
    true,
    false
)
ON CONFLICT (username) DO NOTHING;

-- Get the role and user IDs
DO $$
DECLARE
    v_role_id BIGINT;
    v_user_id BIGINT;
BEGIN
    -- Get the SUPER_ADMIN role ID
    SELECT id INTO v_role_id FROM roles WHERE name = 'SUPER_ADMIN';
    
    -- Get the superadmin user ID
    SELECT id INTO v_user_id FROM users WHERE username = 'superadmin';
    
    -- Create the user-role relationship if it doesn't exist
    INSERT INTO user_roles (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
END $$; 