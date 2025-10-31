-- Alter IOP columns to DECIMAL to support fractional values
-- Safe to run multiple times

DO $$
BEGIN
    -- iop_right
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'main_examinations' AND column_name = 'iop_right'
    ) THEN
        BEGIN
            EXECUTE 'ALTER TABLE main_examinations ALTER COLUMN iop_right TYPE NUMERIC(4,1) USING iop_right::numeric';
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Skipping alter of iop_right: %', SQLERRM;
        END;
    END IF;

    -- iop_left
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'main_examinations' AND column_name = 'iop_left'
    ) THEN
        BEGIN
            EXECUTE 'ALTER TABLE main_examinations ALTER COLUMN iop_left TYPE NUMERIC(4,1) USING iop_left::numeric';
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Skipping alter of iop_left: %', SQLERRM;
        END;
    END IF;
END $$;


