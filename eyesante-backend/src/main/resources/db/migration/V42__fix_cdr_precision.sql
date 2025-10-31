-- Fix CDR column precision to handle larger values
ALTER TABLE main_examinations ALTER COLUMN cdr_right TYPE NUMERIC(4,2);
ALTER TABLE main_examinations ALTER COLUMN cdr_left TYPE NUMERIC(4,2);
