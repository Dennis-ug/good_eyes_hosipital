-- Make user_id nullable in invoices table to allow automatic invoice creation
-- without requiring a doctor to be assigned immediately
ALTER TABLE invoices 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN invoices.user_id IS 'Can be null for automatically created invoices before doctor assignment'; 