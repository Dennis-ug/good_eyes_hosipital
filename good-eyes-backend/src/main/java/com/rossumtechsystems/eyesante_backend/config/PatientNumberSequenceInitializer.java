package com.rossumtechsystems.eyesante_backend.config;

import com.rossumtechsystems.eyesante_backend.service.PatientNumberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class PatientNumberSequenceInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private PatientNumberService patientNumberService;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Override
    public void run(String... args) throws Exception {
        // Skip initialization in development for faster startup
        if ("dev".equals(activeProfile)) {
            System.out.println("Skipping patient number sequence initialization in development mode for faster startup.");
            return;
        }
        
        initializePatientNumberSequence();
    }

    private void initializePatientNumberSequence() {
        try {
            // Check if the sequence table exists
            String checkTableSql = """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'patient_number_sequence'
                );
                """;
            
            Boolean tableExists = jdbcTemplate.queryForObject(checkTableSql, Boolean.class);
            
            if (tableExists == null || !tableExists) {
                System.out.println("Patient number sequence table not found. Creating it...");
                createSequenceTable();
            } else {
                System.out.println("Patient number sequence table already exists.");
            }
            
            // Check if the function exists
            String checkFunctionSql = """
                SELECT EXISTS (
                    SELECT FROM information_schema.routines 
                    WHERE routine_schema = 'public' 
                    AND routine_name = 'get_next_patient_number'
                );
                """;
            
            Boolean functionExists = jdbcTemplate.queryForObject(checkFunctionSql, Boolean.class);
            
            if (functionExists == null || !functionExists) {
                System.out.println("Patient number function not found. Creating it...");
                createSequenceFunction();
            } else {
                System.out.println("Patient number function already exists.");
            }
            
            // Initialize the sequence with current highest patient number
            patientNumberService.initializeSequence();
            System.out.println("Patient number sequence initialized successfully.");
            
        } catch (Exception e) {
            System.err.println("Error initializing patient number sequence: " + e.getMessage());
            // Don't throw the exception to allow the application to start
        }
    }

    private void createSequenceTable() {
        String createTableSql = """
            CREATE TABLE patient_number_sequence (
                id BIGINT PRIMARY KEY DEFAULT 1,
                current_number BIGINT NOT NULL DEFAULT 0
            );
            """;
        
        String insertInitialSql = """
            INSERT INTO patient_number_sequence (id, current_number) VALUES (1, 0);
            """;
        
        jdbcTemplate.execute(createTableSql);
        jdbcTemplate.execute(insertInitialSql);
    }

    private void createSequenceFunction() {
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
        
        jdbcTemplate.execute(createFunctionSql);
    }
} 