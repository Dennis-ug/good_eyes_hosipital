-- Widen enum-like columns to fit full values such as BASIC_REFRACTION_COMPLETED
-- Safe to run multiple times; only alters type/length

DO $$ BEGIN
    -- status may be too short (e.g., VARCHAR(20)) for values like BASIC_REFRACTION_COMPLETED
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patient_visit_sessions'
          AND column_name = 'status'
    ) THEN
        EXECUTE 'ALTER TABLE patient_visit_sessions ALTER COLUMN status TYPE VARCHAR(64)';
    END IF;

    -- current_stage can be longer than 20 as well
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patient_visit_sessions'
          AND column_name = 'current_stage'
    ) THEN
        EXECUTE 'ALTER TABLE patient_visit_sessions ALTER COLUMN current_stage TYPE VARCHAR(64)';
    END IF;

    -- visit_purpose can exceed 20 (e.g., ROUTINE_CHECKUP)
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patient_visit_sessions'
          AND column_name = 'visit_purpose'
    ) THEN
        EXECUTE 'ALTER TABLE patient_visit_sessions ALTER COLUMN visit_purpose TYPE VARCHAR(64)';
    END IF;
END $$;


