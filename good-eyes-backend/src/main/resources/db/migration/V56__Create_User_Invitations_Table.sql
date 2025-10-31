-- Create user_invitations table
CREATE TABLE user_invitations (
    id BIGSERIAL PRIMARY KEY,
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    custom_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    invited_by VARCHAR(255) NOT NULL,
    invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    department_id BIGINT REFERENCES departments(id)
);

-- Create invitation_roles table for many-to-many relationship
CREATE TABLE invitation_roles (
    invitation_id BIGINT NOT NULL REFERENCES user_invitations(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (invitation_id, role_name)
);

-- Create indexes for better performance
CREATE INDEX idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);
CREATE INDEX idx_user_invitations_invited_by ON user_invitations(invited_by);
CREATE INDEX idx_user_invitations_expires_at ON user_invitations(expires_at);
