-- Add sample patient procedures for testing
INSERT INTO patient_procedures (visit_session_id, procedure_id, eye_side, cost, performed, performed_by, staff_fee, notes, created_by, created_at, updated_by, updated_at)
SELECT 13, p.id, 'BOTH', p.price, true, 'Dr. Smith', p.price * 0.1, 'Sample procedure for testing', 'system', NOW(), 'system', NOW()
FROM procedures p
WHERE p.name = 'Slit Lamp Examination'
AND NOT EXISTS (SELECT 1 FROM patient_procedures WHERE visit_session_id = 13 AND procedure_id = p.id);

INSERT INTO patient_procedures (visit_session_id, procedure_id, eye_side, cost, performed, performed_by, staff_fee, notes, created_by, created_at, updated_by, updated_at)
SELECT 13, p.id, 'RIGHT', p.price, false, NULL, p.price * 0.15, 'Pending procedure', 'system', NOW(), 'system', NOW()
FROM procedures p
WHERE p.name = 'Fundus Examination'
AND NOT EXISTS (SELECT 1 FROM patient_procedures WHERE visit_session_id = 13 AND procedure_id = p.id);

INSERT INTO patient_procedures (visit_session_id, procedure_id, eye_side, cost, performed, performed_by, staff_fee, notes, created_by, created_at, updated_by, updated_at)
SELECT 13, p.id, 'LEFT', p.price, true, 'Dr. Johnson', p.price * 0.12, 'Completed successfully', 'system', NOW(), 'system', NOW()
FROM procedures p
WHERE p.name = 'Tonometry'
AND NOT EXISTS (SELECT 1 FROM patient_procedures WHERE visit_session_id = 13 AND procedure_id = p.id);
