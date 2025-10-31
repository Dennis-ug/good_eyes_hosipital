-- Add password reset fields to users table

-- Add reset token and expiry fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Create index for reset token lookup
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Create index for email lookup (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
