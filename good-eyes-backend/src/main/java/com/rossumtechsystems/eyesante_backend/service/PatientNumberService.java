package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.entity.Patient;
import com.rossumtechsystems.eyesante_backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientNumberService {

    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String PREFIX = "ESP-";

    public String generatePatientNumber() {
        try {
            System.out.println("Attempting to generate patient number using database function...");
            // Use the database function to get the next patient number atomically
            String sql = "SELECT get_next_patient_number()";
            String result = jdbcTemplate.queryForObject(sql, String.class);
            System.out.println("Successfully generated patient number: " + result);
            return result;
        } catch (Exception e) {
            // Fallback: if the function doesn't exist, create it and try again
            System.err.println("Patient number function not found. Creating it... Error: " + e.getMessage());
            try {
                createSequenceIfNotExists();
                String result = jdbcTemplate.queryForObject("SELECT get_next_patient_number()", String.class);
                System.out.println("Generated patient number after creating sequence: " + result);
                return result;
            } catch (Exception fallbackError) {
                // If even the fallback fails, throw the original error
                System.err.println("Failed to create sequence: " + fallbackError.getMessage());
                throw e;
            }
        }
    }
    
    private void createSequenceIfNotExists() {
        System.out.println("Creating sequence table and function...");
        
        // Create the sequence table if it doesn't exist
        String createTableSql = """
            CREATE TABLE IF NOT EXISTS patient_number_sequence (
                id BIGINT PRIMARY KEY DEFAULT 1,
                current_number BIGINT NOT NULL DEFAULT 0
            );
            """;
        
        String insertInitialSql = """
            INSERT INTO patient_number_sequence (id, current_number) 
            VALUES (1, 0) 
            ON CONFLICT (id) DO NOTHING;
            """;
        
        // Create the function
        String createFunctionSql = """
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
            """;
        
        try {
            jdbcTemplate.execute(createTableSql);
            System.out.println("Sequence table created successfully");
            jdbcTemplate.execute(insertInitialSql);
            System.out.println("Initial sequence value inserted");
            jdbcTemplate.execute(createFunctionSql);
            System.out.println("Sequence function created successfully");
        } catch (Exception e) {
            System.err.println("Error creating sequence: " + e.getMessage());
            throw e;
        }
    }

    public boolean isPatientNumberUnique(String patientNumber) {
        return !patientRepository.existsByPatientNumber(patientNumber);
    }
    
    /**
     * Assign patient numbers to existing patients that don't have one
     */
    public void assignPatientNumbersToExistingPatients() {
        // Get all patients without patient numbers
        List<Patient> patientsWithoutNumbers = patientRepository.findByPatientNumberIsNull();
        
        for (Patient patient : patientsWithoutNumbers) {
            try {
                String patientNumber = generatePatientNumber();
                patient.setPatientNumber(patientNumber);
                patientRepository.save(patient);
                System.out.println("Assigned patient number " + patientNumber + " to patient " + patient.getId());
            } catch (Exception e) {
                // Fallback: use EP-{id} format if patient number generation fails
                String fallbackNumber = "EP-" + patient.getId();
                patient.setPatientNumber(fallbackNumber);
                patientRepository.save(patient);
                System.out.println("Assigned fallback patient number " + fallbackNumber + " to patient " + patient.getId());
            }
        }
    }
    
    /**
     * Initialize the sequence with the current highest patient number
     */
    public void initializeSequence() {
        // Find the highest existing patient number
        String highestNumber = patientRepository.findHighestPatientNumber();
        
        if (highestNumber != null) {
            // Extract the numeric part and set the sequence
            String numericPart = highestNumber.substring(PREFIX.length());
            long currentNumber = Long.parseLong(numericPart);
            
            // Update the sequence to start from the next number
            String sql = "UPDATE patient_number_sequence SET current_number = ? WHERE id = 1";
            jdbcTemplate.update(sql, currentNumber);
        }
    }
} 