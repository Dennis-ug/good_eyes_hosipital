-- Enforce one record per visit session for triage, basic refraction, and main examination

-- triage_measurements: unique visit_session_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ux_triage_visit_session_id'
    ) THEN
        EXECUTE 'CREATE UNIQUE INDEX ux_triage_visit_session_id ON triage_measurements(visit_session_id)';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not create unique index ux_triage_visit_session_id: %', SQLERRM;
END $$;

-- basic_refraction_exams: unique visit_session_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ux_basic_refraction_visit_session_id'
    ) THEN
        EXECUTE 'CREATE UNIQUE INDEX ux_basic_refraction_visit_session_id ON basic_refraction_exams(visit_session_id)';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not create unique index ux_basic_refraction_visit_session_id: %', SQLERRM;
END $$;

-- main_examinations: unique visit_session_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ux_main_exam_visit_session_id'
    ) THEN
        EXECUTE 'CREATE UNIQUE INDEX ux_main_exam_visit_session_id ON main_examinations(visit_session_id)';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not create unique index ux_main_exam_visit_session_id: %', SQLERRM;
END $$;


