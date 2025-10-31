-- Create patient_diagnoses table
CREATE TABLE patient_diagnoses (
    id BIGSERIAL PRIMARY KEY,
    visit_session_id BIGINT NOT NULL REFERENCES patient_visit_sessions(id) ON DELETE CASCADE,
    diagnosis_id BIGINT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
    diagnosis_date TIMESTAMP NOT NULL DEFAULT NOW(),
    severity VARCHAR(20) CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL')),
    notes TEXT,
    is_primary_diagnosis BOOLEAN DEFAULT FALSE,
    is_confirmed BOOLEAN DEFAULT FALSE,
    diagnosed_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(255),
    UNIQUE(visit_session_id, diagnosis_id)
);

-- Create indexes for better performance
CREATE INDEX idx_patient_diagnoses_visit_session_id ON patient_diagnoses(visit_session_id);
CREATE INDEX idx_patient_diagnoses_diagnosis_id ON patient_diagnoses(diagnosis_id);
CREATE INDEX idx_patient_diagnoses_diagnosis_date ON patient_diagnoses(diagnosis_date);
CREATE INDEX idx_patient_diagnoses_primary ON patient_diagnoses(is_primary_diagnosis);
CREATE INDEX idx_patient_diagnoses_confirmed ON patient_diagnoses(is_confirmed);

-- Create index for patient diagnoses through visit sessions
CREATE INDEX idx_patient_diagnoses_patient_id ON patient_diagnoses(visit_session_id) 
INCLUDE (diagnosis_date, severity, is_primary_diagnosis, is_confirmed);
