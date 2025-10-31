-- Migration to update patient and refraction fields
-- Remove religion column and update refraction fields to accept text

-- Remove religion column from patients table
ALTER TABLE patients DROP COLUMN IF EXISTS religion;

-- Update refraction fields in basic_refraction_exams table to accept text
-- Autorefractor fields
ALTER TABLE basic_refraction_exams 
ALTER COLUMN manifest_auto_right_sphere TYPE VARCHAR(50),
ALTER COLUMN manifest_auto_right_cylinder TYPE VARCHAR(50),
ALTER COLUMN manifest_auto_right_axis TYPE VARCHAR(50),
ALTER COLUMN manifest_auto_left_sphere TYPE VARCHAR(50),
ALTER COLUMN manifest_auto_left_cylinder TYPE VARCHAR(50),
ALTER COLUMN manifest_auto_left_axis TYPE VARCHAR(50);

-- Retinoscope fields
ALTER TABLE basic_refraction_exams 
ALTER COLUMN manifest_ret_right_sphere TYPE VARCHAR(50),
ALTER COLUMN manifest_ret_right_cylinder TYPE VARCHAR(50),
ALTER COLUMN manifest_ret_right_axis TYPE VARCHAR(50),
ALTER COLUMN manifest_ret_left_sphere TYPE VARCHAR(50),
ALTER COLUMN manifest_ret_left_cylinder TYPE VARCHAR(50),
ALTER COLUMN manifest_ret_left_axis TYPE VARCHAR(50);

-- Subjective fields
ALTER TABLE basic_refraction_exams 
ALTER COLUMN subjective_right_sphere TYPE VARCHAR(50),
ALTER COLUMN subjective_right_cylinder TYPE VARCHAR(50),
ALTER COLUMN subjective_right_axis TYPE VARCHAR(50),
ALTER COLUMN subjective_left_sphere TYPE VARCHAR(50),
ALTER COLUMN subjective_left_cylinder TYPE VARCHAR(50),
ALTER COLUMN subjective_left_axis TYPE VARCHAR(50);

-- Keratometry fields
ALTER TABLE basic_refraction_exams 
ALTER COLUMN keratometry_k1_right TYPE VARCHAR(50),
ALTER COLUMN keratometry_k2_right TYPE VARCHAR(50),
ALTER COLUMN keratometry_axis_right TYPE VARCHAR(50),
ALTER COLUMN keratometry_k1_left TYPE VARCHAR(50),
ALTER COLUMN keratometry_k2_left TYPE VARCHAR(50),
ALTER COLUMN keratometry_axis_left TYPE VARCHAR(50);

-- Additional fields
ALTER TABLE basic_refraction_exams 
ALTER COLUMN pd_right_eye TYPE VARCHAR(50),
ALTER COLUMN pd_left_eye TYPE VARCHAR(50);

-- Update enhanced fields if they exist
DO $$
BEGIN
    -- Check if enhanced fields exist and update them
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'basic_refraction_exams' AND column_name = 'pupil_size_right') THEN
        ALTER TABLE basic_refraction_exams ALTER COLUMN pupil_size_right TYPE VARCHAR(50);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'basic_refraction_exams' AND column_name = 'pupil_size_left') THEN
        ALTER TABLE basic_refraction_exams ALTER COLUMN pupil_size_left TYPE VARCHAR(50);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'basic_refraction_exams' AND column_name = 'iop_right') THEN
        ALTER TABLE basic_refraction_exams ALTER COLUMN iop_right TYPE VARCHAR(50);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'basic_refraction_exams' AND column_name = 'iop_left') THEN
        ALTER TABLE basic_refraction_exams ALTER COLUMN iop_left TYPE VARCHAR(50);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'basic_refraction_exams' AND column_name = 'stereopsis') THEN
        ALTER TABLE basic_refraction_exams ALTER COLUMN stereopsis TYPE VARCHAR(50);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'basic_refraction_exams' AND column_name = 'near_addition_right') THEN
        ALTER TABLE basic_refraction_exams ALTER COLUMN near_addition_right TYPE VARCHAR(50);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'basic_refraction_exams' AND column_name = 'near_addition_left') THEN
        ALTER TABLE basic_refraction_exams ALTER COLUMN near_addition_left TYPE VARCHAR(50);
    END IF;
END $$;

