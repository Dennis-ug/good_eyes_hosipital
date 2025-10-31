CREATE TABLE IF NOT EXISTS deleted_invoices (
  id BIGSERIAL PRIMARY KEY,
  original_invoice_id BIGINT NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE,
  patient_id BIGINT,
  patient_name VARCHAR(255),
  total_amount NUMERIC(10,2),
  invoice_purpose VARCHAR(64),
  items_json TEXT,
  deleted_by VARCHAR(100),
  deleted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deleted_invoices_original_id ON deleted_invoices(original_invoice_id);

