-- Create sequence table for patient numbers
CREATE TABLE patient_number_sequence (
    id BIGINT PRIMARY KEY DEFAULT 1,
    current_number BIGINT NOT NULL DEFAULT 0
);

-- Insert initial value
INSERT INTO patient_number_sequence (id, current_number) VALUES (1, 0);

-- Create function to get next patient number
CREATE OR REPLACE FUNCTION get_next_patient_number()
RETURNS VARCHAR AS $$
DECLARE
    next_number BIGINT;
    result VARCHAR;
BEGIN
    -- Get and increment the current number atomically
    UPDATE patient_number_sequence 
    SET current_number = current_number + 1 
    WHERE id = 1 
    RETURNING current_number INTO next_number;
    
    -- Format the result
    result := 'ESP-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql; 