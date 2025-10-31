CREATE TABLE IF NOT EXISTS surgery_reports (
    id BIGSERIAL PRIMARY KEY,
    patient_procedure_id BIGINT NOT NULL REFERENCES patient_procedures(id),
    anesthesia_type VARCHAR(20) NOT NULL,
    diagnosis TEXT,
    surgery_type VARCHAR(20) NOT NULL,
    eye_side VARCHAR(10),
    surgeon_name VARCHAR(255),
    assistant_name VARCHAR(255),
    comments TEXT,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_surgery_reports_patient_procedure_id ON surgery_reports(patient_procedure_id);

