-- Create table for slit lamp observations linked to main examinations
CREATE TABLE IF NOT EXISTS slit_lamp_observations (
    id BIGSERIAL PRIMARY KEY,
    main_exam_id BIGINT NOT NULL,
    structure VARCHAR(100),
    finding TEXT,
    eye_side VARCHAR(10),
    CONSTRAINT fk_slit_lamp_main_exam FOREIGN KEY (main_exam_id)
        REFERENCES main_examinations (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_slit_lamp_main_exam ON slit_lamp_observations(main_exam_id);

