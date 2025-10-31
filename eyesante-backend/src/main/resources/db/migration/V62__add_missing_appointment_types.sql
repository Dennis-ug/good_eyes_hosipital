-- Add missing appointment types to the database
-- This ensures all appointment types referenced in the code exist

-- FOLLOW_UP
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('FOLLOW_UP', 'Follow-up examination for existing conditions', 45, 75000.00, true, false, true, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- ROUTINE_EXAMINATION
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('ROUTINE_EXAMINATION', 'Regular eye examination for vision assessment', 30, 50000.00, false, false, false, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- EMERGENCY
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('EMERGENCY', 'Urgent eye care for immediate issues', 60, 100000.00, false, false, false, 1, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- SURGERY_CONSULTATION
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('SURGERY_CONSULTATION', 'Consultation for surgical procedures', 60, 120000.00, true, true, true, 30, 48, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- PRESCRIPTION_RENEWAL
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('PRESCRIPTION_RENEWAL', 'Update glasses or contact lens prescription', 30, 45000.00, false, false, false, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- DIAGNOSTIC_TEST
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('DIAGNOSTIC_TEST', 'Specialized diagnostic testing', 45, 80000.00, true, false, true, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- PRE_OPERATIVE_ASSESSMENT
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('PRE_OPERATIVE_ASSESSMENT', 'Assessment before surgical procedures', 60, 90000.00, true, true, true, 30, 48, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- POST_OPERATIVE_FOLLOW_UP
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('POST_OPERATIVE_FOLLOW_UP', 'Follow-up after surgical procedures', 30, 60000.00, true, false, true, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- VISION_THERAPY
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('VISION_THERAPY', 'Vision therapy sessions', 45, 70000.00, true, false, true, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- CONTACT_LENS_FITTING
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('CONTACT_LENS_FITTING', 'Contact lens fitting and training', 30, 60000.00, false, false, false, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- GLASSES_FITTING
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('GLASSES_FITTING', 'Glasses fitting and adjustment', 20, 25000.00, false, false, false, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- GLAUCOMA_SCREENING
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('GLAUCOMA_SCREENING', 'Glaucoma screening and monitoring', 45, 75000.00, true, false, true, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- CATARACT_EVALUATION
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('CATARACT_EVALUATION', 'Cataract assessment and consultation', 45, 85000.00, true, false, true, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- RETINAL_EXAMINATION
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('RETINAL_EXAMINATION', 'Retinal examination and imaging', 45, 90000.00, true, false, true, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- PEDIATRIC_EXAMINATION
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours, is_active, created_at, updated_at)
VALUES ('PEDIATRIC_EXAMINATION', 'Eye examination for children', 30, 55000.00, false, false, false, 30, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
