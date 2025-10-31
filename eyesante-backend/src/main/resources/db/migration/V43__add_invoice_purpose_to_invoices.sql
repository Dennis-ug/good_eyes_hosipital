-- Add invoice_purpose to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_purpose VARCHAR(64);
