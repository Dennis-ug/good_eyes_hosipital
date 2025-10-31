package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.PatientDto;
import com.rossumtechsystems.eyesante_backend.service.PatientService;
import com.rossumtechsystems.eyesante_backend.service.PatientNumberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;
    
    @Autowired
    private PatientNumberService patientNumberService;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Page<PatientDto>> getAllPatients(Pageable pageable) {
        Page<PatientDto> patients = patientService.getAllPatients(pageable);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PatientDto>> searchPatients(
            @RequestParam(required = false) String query,
            Pageable pageable) {
        Page<PatientDto> patients = patientService.searchPatients(query, pageable);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<PatientDto>> getAllPatientsSortedByLatest() {
        java.util.List<PatientDto> patients = patientService.getAllPatientsSortedByLatest();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PATIENT_CREATE')")
    public ResponseEntity<PatientDto> createPatient(@Valid @RequestBody PatientDto patientDto) {
        // Set the current logged-in user as received by
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getName())) {
            patientDto.setReceivedBy(authentication.getName());
        } else {
            patientDto.setReceivedBy("system");
        }
        
        PatientDto createdPatient = patientService.createPatient(patientDto);
        return ResponseEntity.ok(createdPatient);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<PatientDto> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientDto patientDto) {
        return patientService.updatePatient(id, patientDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/update-reception-data")
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> updatePatientsWithNullReceptionData() {
        int updatedCount = patientService.updatePatientsWithNullReceptionData();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully updated " + updatedCount + " patients with reception data");
        response.put("updatedCount", updatedCount);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/update-null-patient-numbers", "/update-null-patient-number"})
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> updatePatientsWithNullPatientNumbers() {
        int updatedCount = patientService.updatePatientsWithNullPatientNumbers();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully updated " + updatedCount + " patients with EP-{id} format");
        response.put("updatedCount", updatedCount);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ensure-patient-numbers")
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> ensureAllPatientsHaveNumbers() {
        int updatedCount = patientService.ensureAllPatientsHaveNumbers();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully ensured " + updatedCount + " patients have patient numbers");
        response.put("updatedCount", updatedCount);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-and-assign-patient-numbers")
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> resetAndAssignPatientNumbers() {
        int updatedCount = patientService.resetAndAssignPatientNumbers();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully reset sequence and assigned ESP- format numbers to " + updatedCount + " patients");
        response.put("updatedCount", updatedCount);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assign-patient-numbers-by-id")
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> assignPatientNumbersById() {
        int updatedCount = patientService.assignPatientNumbersById();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully assigned ESP- format numbers using patient ID to " + updatedCount + " patients");
        response.put("updatedCount", updatedCount);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sequence-status")
    public ResponseEntity<Map<String, Object>> getSequenceStatus() {
        try {
            String sql = "SELECT current_number FROM patient_number_sequence WHERE id = 1";
            Integer currentNumber = jdbcTemplate.queryForObject(sql, Integer.class);
            
            Map<String, Object> response = new HashMap<>();
            response.put("currentSequence", currentNumber);
            response.put("nextPatientNumber", "ESP-" + String.format("%06d", (currentNumber != null ? currentNumber + 1 : 1)));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Failed to get sequence status: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/update-sequence-to-highest-id")
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> updateSequenceToHighestPatientId() {
        int maxId = patientService.updateSequenceToHighestPatientId();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully updated sequence to highest patient ID: " + maxId);
        response.put("maxPatientId", maxId);
        response.put("nextPatientNumber", "ESP-" + String.format("%06d", maxId + 1));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/automatic-patient-number-assignment")
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> automaticPatientNumberAssignment() {
        int updatedCount = patientService.automaticPatientNumberAssignment();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "🎉 Automatic patient number assignment completed successfully!");
        response.put("updatedCount", updatedCount);
        response.put("status", "success");
        response.put("details", "All patients now have ESP- format numbers and sequence is properly updated");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    public ResponseEntity<Map<String, Object>> restorePatient(@PathVariable Long id) {
        try {
            patientService.restorePatient(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "✅ Patient restored successfully");
            response.put("patientId", id);
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "❌ Failed to restore patient: " + e.getMessage());
            response.put("status", "error");
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/deleted")
    @PreAuthorize("hasAuthority('PATIENT_READ')")
    public ResponseEntity<Page<PatientDto>> getDeletedPatients(Pageable pageable) {
        Page<PatientDto> deletedPatients = patientService.getDeletedPatients(pageable);
        return ResponseEntity.ok(deletedPatients);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PATIENT_DELETE')")
    public ResponseEntity<Map<String, Object>> deletePatient(@PathVariable Long id) {
        try {
            patientService.deletePatient(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "✅ Patient soft deleted successfully");
            response.put("patientId", id);
            response.put("status", "success");
            response.put("details", "Patient has been marked as deleted and can be restored later");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "❌ Failed to delete patient: " + e.getMessage());
            response.put("status", "error");
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/assign-patient-numbers")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> assignPatientNumbersToExistingPatients() {
        try {
            patientNumberService.assignPatientNumbersToExistingPatients();
            return ResponseEntity.ok("Patient numbers assigned successfully to existing patients");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error assigning patient numbers: " + e.getMessage());
        }
    }
    
    @PostMapping("/initialize-sequence")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> initializeSequence() {
        try {
            patientNumberService.initializeSequence();
            return ResponseEntity.ok("Patient number sequence initialized successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error initializing sequence: " + e.getMessage());
        }
    }
    
    @PostMapping("/test-patient-number-generation")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> testPatientNumberGeneration() {
        try {
            String patientNumber = patientNumberService.generatePatientNumber();
            return ResponseEntity.ok("Generated patient number: " + patientNumber);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating patient number: " + e.getMessage());
        }
    }
} 