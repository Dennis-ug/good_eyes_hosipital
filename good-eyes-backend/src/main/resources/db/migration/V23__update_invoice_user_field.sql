-- Update invoices table to use user_id instead of doctor_id
-- This allows any logged-in user to create invoices

-- Add foreign key constraint for user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_invoices_user' 
        AND table_name = 'invoices'
    ) THEN
        ALTER TABLE invoices 
        ADD CONSTRAINT fk_invoices_user 
        FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END $$;

-- Update existing records to set user_id to a default user if available
-- (This is optional - can be left null for existing records)
UPDATE invoices 
SET user_id = (SELECT id FROM users LIMIT 1)
WHERE user_id IS NULL AND EXISTS (SELECT 1 FROM users LIMIT 1);

-- Drop the old doctor_id column and its constraint if they exist
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS fk_invoices_doctor;

ALTER TABLE invoices 
DROP COLUMN IF EXISTS doctor_id;

-- Add index for user_id for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

-- Add comment to explain the change
COMMENT ON COLUMN invoices.user_id IS 'References the user who created the invoice (can be any logged-in user)'; 