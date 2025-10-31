-- Migration script for Basic Refraction Exam enhancements
-- Adding missing fields for comprehensive optometric examination

-- Add pupil size measurements
ALTER TABLE basic_refraction_exams 
ADD COLUMN IF NOT EXISTS pupil_size_right DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS pupil_size_left DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS pupil_size_unit VARCHAR(10) DEFAULT 'mm';

-- Add intraocular pressure measurements
ALTER TABLE basic_refraction_exams 
ADD COLUMN IF NOT EXISTS iop_right INTEGER,
ADD COLUMN IF NOT EXISTS iop_left INTEGER,
ADD COLUMN IF NOT EXISTS iop_method VARCHAR(50);

-- Add color vision testing
ALTER TABLE basic_refraction_exams 
ADD COLUMN IF NOT EXISTS color_vision_right VARCHAR(20),
ADD COLUMN IF NOT EXISTS color_vision_left VARCHAR(20),
ADD COLUMN IF NOT EXISTS color_vision_test VARCHAR(30);

-- Add stereopsis measurement
ALTER TABLE basic_refraction_exams 
ADD COLUMN IF NOT EXISTS stereopsis INTEGER,
ADD COLUMN IF NOT EXISTS stereopsis_unit VARCHAR(20) DEFAULT 'arcseconds';

-- Add near addition for presbyopia
ALTER TABLE basic_refraction_exams 
ADD COLUMN IF NOT EXISTS near_addition_right DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS near_addition_left DOUBLE PRECISION;

-- Add clinical assessment fields
ALTER TABLE basic_refraction_exams 
ADD COLUMN IF NOT EXISTS clinical_assessment TEXT,
ADD COLUMN IF NOT EXISTS diagnosis TEXT,
ADD COLUMN IF NOT EXISTS treatment_plan TEXT;

-- Add equipment tracking
ALTER TABLE basic_refraction_exams 
ADD COLUMN IF NOT EXISTS equipment_used VARCHAR(100),
ADD COLUMN IF NOT EXISTS equipment_calibration_date DATE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_basic_refraction_pupil_size ON basic_refraction_exams(pupil_size_right, pupil_size_left);
CREATE INDEX IF NOT EXISTS idx_basic_refraction_iop ON basic_refraction_exams(iop_right, iop_left);
CREATE INDEX IF NOT EXISTS idx_basic_refraction_color_vision ON basic_refraction_exams(color_vision_right, color_vision_left);
CREATE INDEX IF NOT EXISTS idx_basic_refraction_stereopsis ON basic_refraction_exams(stereopsis);
