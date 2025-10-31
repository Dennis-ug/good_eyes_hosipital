-- Add soft delete columns to appointments table
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255) NULL;

-- Ensure existing rows are marked as not deleted
UPDATE appointments SET deleted = FALSE WHERE deleted IS NULL;

