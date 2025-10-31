-- Add deleted column to patients table for soft delete functionality
ALTER TABLE patients ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index on deleted column for better query performance
CREATE INDEX idx_patients_deleted ON patients(deleted);

-- Add comment to explain the column purpose
COMMENT ON COLUMN patients.deleted IS 'Soft delete flag - true means the patient is deleted but data is preserved';
