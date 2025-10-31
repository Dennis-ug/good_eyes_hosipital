package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.EyeExaminationDto;
import com.rossumtechsystems.eyesante_backend.dto.PatientDto;
import com.rossumtechsystems.eyesante_backend.entity.Patient;
import com.rossumtechsystems.eyesante_backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private EyeExaminationService eyeExaminationService;
    
    @Autowired
    private PatientNumberService patientNumberService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Page<PatientDto> getAllPatients(Pageable pageable) {
        // If no sorting is specified, default to sorting by creation date descending (latest first)
        if (pageable.getSort().isUnsorted()) {
            pageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(), 
                pageable.getPageSize(), 
                org.springframework.data.domain.Sort.by("createdAt").descending()
            );
        }
        return patientRepository.findByDeletedFalse(pageable).map(this::toDto);
    }

    public List<PatientDto> getAllPatientsSortedByLatest() {
        return patientRepository.findByDeletedFalseOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public Page<PatientDto> searchPatients(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return getAllPatients(pageable);
        }
        
        return patientRepository.searchPatients(query.trim(), pageable).map(this::toDto);
    }

    public Optional<PatientDto> getPatientById(Long id) {
        return patientRepository.findByIdAndDeletedFalse(id).map(this::toDto);
    }

    public PatientDto createPatient(PatientDto dto) {
        // Validate phone uniqueness before creating
        validatePhoneUniqueness(dto.getPhone(), dto.getAlternativePhone(), null);
        
        Patient patient = toEntity(dto);
        // Don't set ID for new patients - let JPA generate it
        patient.setId(null);
        
        // Set reception timestamp for new patients
        patient.setReceptionTimestamp(LocalDateTime.now());
        // Note: receivedBy will be set by the calling service/controller with current user
        
        // Save patient first to get the ID
        Patient savedPatient = patientRepository.save(patient);
        
        // Generate ESP- format patient number based on the generated ID
        String patientNumber = "ESP-" + String.format("%06d", savedPatient.getId());
        savedPatient.setPatientNumber(patientNumber);
        
        // Update the sequence to continue from this ID
        try {
            String updateSql = "INSERT INTO patient_number_sequence (id, current_number) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET current_number = ?";
            jdbcTemplate.update(updateSql, savedPatient.getId().intValue(), savedPatient.getId().intValue());
            System.out.println("✅ Updated sequence to: " + savedPatient.getId());
        } catch (Exception e) {
            System.err.println("❌ Failed to update sequence: " + e.getMessage());
        }
        
        // Save again with the patient number
        savedPatient = patientRepository.save(savedPatient);
        System.out.println("✅ Created patient with ESP- number: " + savedPatient.getPatientNumber());
        
        return toDto(savedPatient);
    }

    public Optional<PatientDto> updatePatient(Long id, PatientDto dto) {
        // Validate phone uniqueness before updating
        validatePhoneUniqueness(dto.getPhone(), dto.getAlternativePhone(), id);
        
        return patientRepository.findById(id).map(existing -> {
            Patient updated = toEntity(dto);
            updated.setId(id);
            return toDto(patientRepository.save(updated));
        });
    }

    /**
     * Update patients with null reception timestamp and received by fields
     * Sets reception timestamp to current time and received by to "Shiba"
     */
    public int updatePatientsWithNullReceptionData() {
        List<Patient> patientsWithNullReception = patientRepository.findByReceptionTimestampIsNullOrReceivedByIsNull();
        
        int updatedCount = 0;
        LocalDateTime currentTime = LocalDateTime.now();
        
        for (Patient patient : patientsWithNullReception) {
            boolean needsUpdate = false;
            
            if (patient.getReceptionTimestamp() == null) {
                patient.setReceptionTimestamp(currentTime);
                needsUpdate = true;
            }
            
            if (patient.getReceivedBy() == null) {
                patient.setReceivedBy("Shiba");
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                patientRepository.save(patient);
                updatedCount++;
            }
        }
        
        return updatedCount;
    }

    /**
     * Update patients with null patient numbers to use EP-{id} format
     */
    public int updatePatientsWithNullPatientNumbers() {
        List<Patient> patientsWithNullNumbers = patientRepository.findByPatientNumberIsNull();
        
        int updatedCount = 0;
        
        for (Patient patient : patientsWithNullNumbers) {
            String fallbackNumber = "EP-" + patient.getId();
            patient.setPatientNumber(fallbackNumber);
            patientRepository.save(patient);
            updatedCount++;
            System.out.println("Updated patient " + patient.getId() + " with fallback number: " + fallbackNumber);
        }
        
        return updatedCount;
    }

    /**
     * Ensure all patients have patient numbers (generate if missing)
     */
    public int ensureAllPatientsHaveNumbers() {
        List<Patient> patientsWithoutNumbers = patientRepository.findByPatientNumberIsNull();
        
        int updatedCount = 0;
        
        for (Patient patient : patientsWithoutNumbers) {
            try {
                // Try to generate a proper patient number first
                String patientNumber = patientNumberService.generatePatientNumber();
                patient.setPatientNumber(patientNumber);
                System.out.println("Generated patient number " + patientNumber + " for patient " + patient.getId());
            } catch (Exception e) {
                // Fallback to EP-{id} format if generation fails
                String fallbackNumber = "EP-" + patient.getId();
                patient.setPatientNumber(fallbackNumber);
                System.out.println("Using fallback number " + fallbackNumber + " for patient " + patient.getId());
            }
            
            patientRepository.save(patient);
            updatedCount++;
        }
        
        return updatedCount;
    }

    /**
     * Reset patient number sequence and assign ESP- format to all patients
     */
    public int resetAndAssignPatientNumbers() {
        // Step 1: Clear all existing patient numbers first
        try {
            String clearSql = "UPDATE patients SET patient_number = NULL";
            int clearedCount = jdbcTemplate.update(clearSql);
            System.out.println("Cleared " + clearedCount + " existing patient numbers");
        } catch (Exception e) {
            System.err.println("Failed to clear existing patient numbers: " + e.getMessage());
        }
        
        // Step 2: Reset the sequence to start from 0
        try {
            String resetSql = "UPDATE patient_number_sequence SET current_number = 0 WHERE id = 1";
            jdbcTemplate.update(resetSql);
            System.out.println("Reset patient number sequence to 0");
        } catch (Exception e) {
            System.err.println("Failed to reset sequence: " + e.getMessage());
        }
        
        // Step 3: Get all patients ordered by ID
        List<Patient> allPatients = patientRepository.findAllByOrderByIdAsc();
        
        int updatedCount = 0;
        int highestNumber = 0;
        
        for (Patient patient : allPatients) {
            try {
                // Generate new patient number in ESP- format
                String patientNumber = patientNumberService.generatePatientNumber();
                patient.setPatientNumber(patientNumber);
                patientRepository.save(patient);
                updatedCount++;
                
                // Extract the number part to track the highest
                String numberPart = patientNumber.replace("ESP-", "");
                int currentNumber = Integer.parseInt(numberPart);
                if (currentNumber > highestNumber) {
                    highestNumber = currentNumber;
                }
                
                System.out.println("Assigned " + patientNumber + " to patient " + patient.getId() + " (" + patient.getFirstName() + " " + patient.getLastName() + ")");
            } catch (Exception e) {
                System.err.println("Failed to generate patient number for patient " + patient.getId() + ": " + e.getMessage());
                // Continue with next patient
            }
        }
        
        // Step 4: Update the sequence to continue from the highest assigned number
        try {
            String updateSql = "UPDATE patient_number_sequence SET current_number = ? WHERE id = 1";
            jdbcTemplate.update(updateSql, highestNumber);
            System.out.println("Updated sequence to continue from: " + highestNumber);
            System.out.println("Next patient number will be: ESP-" + String.format("%06d", highestNumber + 1));
        } catch (Exception e) {
            System.err.println("Failed to update sequence: " + e.getMessage());
        }
        
        return updatedCount;
    }

    /**
     * Automatic ESP- format patient number assignment for all patients
     * This method handles everything automatically:
     * 1. Clears existing patient numbers
     * 2. Resets sequence to 0
     * 3. Assigns ESP- format numbers using patient ID
     * 4. Updates sequence to continue properly
     */
    public int automaticPatientNumberAssignment() {
        System.out.println("🚀 Starting automatic patient number assignment...");
        
        // Step 1: Clear all existing patient numbers
        try {
            String clearSql = "UPDATE patients SET patient_number = NULL";
            int clearedCount = jdbcTemplate.update(clearSql);
            System.out.println("✅ Cleared " + clearedCount + " existing patient numbers");
        } catch (Exception e) {
            System.err.println("❌ Failed to clear existing patient numbers: " + e.getMessage());
        }
        
        // Step 2: Reset sequence to 0
        try {
            String resetSql = "INSERT INTO patient_number_sequence (id, current_number) VALUES (1, 0) ON CONFLICT (id) DO UPDATE SET current_number = 0";
            jdbcTemplate.update(resetSql);
            System.out.println("✅ Reset sequence to 0");
        } catch (Exception e) {
            System.err.println("❌ Failed to reset sequence: " + e.getMessage());
        }
        
        // Step 3: Get all non-deleted patients ordered by ID
        List<Patient> allPatients = patientRepository.findByDeletedFalseOrderByIdAsc();
        System.out.println("📋 Found " + allPatients.size() + " non-deleted patients to process");
        
        int updatedCount = 0;
        int highestNumber = 0;
        
        // Step 4: Assign ESP- format numbers to all patients
        for (Patient patient : allPatients) {
            try {
                // Create patient number based on patient ID
                String patientNumber = "ESP-" + String.format("%06d", patient.getId());
                patient.setPatientNumber(patientNumber);
                patientRepository.save(patient);
                updatedCount++;
                
                // Track the highest number for sequence update
                if (patient.getId() > highestNumber) {
                    highestNumber = (int) patient.getId().longValue();
                }
                
                System.out.println("✅ Assigned " + patientNumber + " to patient " + patient.getId() + " (" + patient.getFirstName() + " " + patient.getLastName() + ")");
            } catch (Exception e) {
                System.err.println("❌ Failed to assign patient number for patient " + patient.getId() + ": " + e.getMessage());
                // Continue with next patient
            }
        }
        
        // Step 5: Update sequence to continue from the highest patient ID
        try {
            String updateSql = "INSERT INTO patient_number_sequence (id, current_number) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET current_number = ?";
            jdbcTemplate.update(updateSql, highestNumber, highestNumber);
            System.out.println("✅ Updated sequence to continue from: " + highestNumber);
            System.out.println("🎯 Next patient number will be: ESP-" + String.format("%06d", highestNumber + 1));
        } catch (Exception e) {
            System.err.println("❌ Failed to update sequence: " + e.getMessage());
        }
        
        System.out.println("🎉 Automatic patient number assignment completed!");
        System.out.println("📊 Summary: " + updatedCount + " patients updated with ESP- format numbers");
        
        return updatedCount;
    }

    /**
     * Assign ESP- format patient numbers using patient ID as reference
     * (Patient ID 1 gets ESP-000001, ID 2 gets ESP-000002, etc.)
     */
    public int assignPatientNumbersById() {
        // Get all non-deleted patients ordered by ID
        List<Patient> allPatients = patientRepository.findByDeletedFalseOrderByIdAsc();
        
        int updatedCount = 0;
        int highestNumber = 0;
        
        for (Patient patient : allPatients) {
            try {
                // Create patient number based on patient ID
                String patientNumber = "ESP-" + String.format("%06d", patient.getId());
                patient.setPatientNumber(patientNumber);
                patientRepository.save(patient);
                updatedCount++;
                
                // Track the highest number for sequence update
                if (patient.getId() > highestNumber) {
                    highestNumber = (int) patient.getId().longValue();
                }
                
                System.out.println("Assigned " + patientNumber + " to patient " + patient.getId() + " (" + patient.getFirstName() + " " + patient.getLastName() + ")");
            } catch (Exception e) {
                System.err.println("Failed to assign patient number for patient " + patient.getId() + ": " + e.getMessage());
                // Continue with next patient
            }
        }
        
        // Update the sequence to continue from the highest patient ID
        try {
            // First, ensure the sequence record exists
            String insertSql = "INSERT INTO patient_number_sequence (id, current_number) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET current_number = ?";
            jdbcTemplate.update(insertSql, highestNumber, highestNumber);
            System.out.println("Updated sequence to continue from: " + highestNumber);
            System.out.println("Next patient number will be: ESP-" + String.format("%06d", highestNumber + 1));
        } catch (Exception e) {
            System.err.println("Failed to update sequence: " + e.getMessage());
            // Try alternative approach
            try {
                String updateSql = "UPDATE patient_number_sequence SET current_number = ? WHERE id = 1";
                int rowsUpdated = jdbcTemplate.update(updateSql, highestNumber);
                if (rowsUpdated == 0) {
                    // If no rows updated, insert the record
                    String insertSql = "INSERT INTO patient_number_sequence (id, current_number) VALUES (1, ?)";
                    jdbcTemplate.update(insertSql, highestNumber);
                }
                System.out.println("Updated sequence to continue from: " + highestNumber);
                System.out.println("Next patient number will be: ESP-" + String.format("%06d", highestNumber + 1));
            } catch (Exception e2) {
                System.err.println("Failed to update sequence with alternative approach: " + e2.getMessage());
            }
        }
        
        return updatedCount;
    }

    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
        
        // Check for related data before soft deletion
        String relatedDataInfo = getRelatedDataInfo(patient);
        if (!relatedDataInfo.isEmpty()) {
            throw new RuntimeException("Cannot delete this resource because it has related data: " + relatedDataInfo);
        }
        
        // Perform soft delete - mark as deleted instead of actually deleting
        patient.setDeleted(true);
        patientRepository.save(patient);
        
        System.out.println("✅ Soft deleted patient: " + patient.getPatientNumber() + " (" + patient.getFirstName() + " " + patient.getLastName() + ")");
        
        // Update sequence to reflect the new highest patient ID among non-deleted patients
        updateSequenceAfterDeletion();
    }
    
    /**
     * Get information about related data that would prevent deletion
     */
    private String getRelatedDataInfo(Patient patient) {
        StringBuilder info = new StringBuilder();
        
        // Check for visit sessions using repository method to avoid lazy loading
        long visitSessionCount = patientRepository.countVisitSessionsByPatientId(patient.getId());
        if (visitSessionCount > 0) {
            info.append("Visit sessions (").append(visitSessionCount).append("), ");
        }
        
        // Check for eye examinations using repository method to avoid lazy loading
        long eyeExaminationCount = patientRepository.countEyeExaminationsByPatientId(patient.getId());
        if (eyeExaminationCount > 0) {
            info.append("Eye examinations (").append(eyeExaminationCount).append("), ");
        }
        
        // Remove trailing comma and space
        if (info.length() > 0) {
            info.setLength(info.length() - 2);
        }
        
        return info.toString();
    }
    
    
    /**
     * Validate phone uniqueness for both phone and alternative phone fields
     * @param phone Primary phone number
     * @param alternativePhone Alternative phone number
     * @param patientId Patient ID (null for new patients, non-null for updates)
     */
    private void validatePhoneUniqueness(String phone, String alternativePhone, Long patientId) {
        // Check primary phone uniqueness
        if (phone != null && !phone.trim().isEmpty()) {
            if (patientId == null) {
                // Creating new patient
                if (patientRepository.existsByPhoneAndDeletedFalse(phone.trim())) {
                    throw new RuntimeException("Phone number '" + phone.trim() + "' is already registered with another patient");
                }
            } else {
                // Updating existing patient
                Optional<Patient> existingPatient = patientRepository.findByPhoneAndDeletedFalseAndIdNot(phone.trim(), patientId);
                if (existingPatient.isPresent()) {
                    throw new RuntimeException("Phone number '" + phone.trim() + "' is already registered with another patient");
                }
            }
        }
        
        // Check alternative phone uniqueness
        if (alternativePhone != null && !alternativePhone.trim().isEmpty()) {
            if (patientId == null) {
                // Creating new patient
                if (patientRepository.existsByAlternativePhoneAndDeletedFalse(alternativePhone.trim())) {
                    throw new RuntimeException("Alternative phone number '" + alternativePhone.trim() + "' is already registered with another patient");
                }
            } else {
                // Updating existing patient
                Optional<Patient> existingPatient = patientRepository.findByAlternativePhoneAndDeletedFalseAndIdNot(alternativePhone.trim(), patientId);
                if (existingPatient.isPresent()) {
                    throw new RuntimeException("Alternative phone number '" + alternativePhone.trim() + "' is already registered with another patient");
                }
            }
        }
        
        // Check that phone and alternative phone are not the same
        if (phone != null && alternativePhone != null && 
            !phone.trim().isEmpty() && !alternativePhone.trim().isEmpty() &&
            phone.trim().equals(alternativePhone.trim())) {
            throw new RuntimeException("Primary phone and alternative phone cannot be the same");
        }
    }

    private PatientDto toDto(Patient patient) {
        PatientDto dto = new PatientDto();
        dto.setId(patient.getId());
        // Handle null patient numbers for existing patients - use EP-{id} format
        dto.setPatientNumber(patient.getPatientNumber() != null ? patient.getPatientNumber() : "EP-" + patient.getId());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setGender(patient.getGender());
        dto.setNationalId(patient.getNationalId());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setAgeInYears(patient.getAgeInYears());
        dto.setAgeInMonths(patient.getAgeInMonths());
        dto.setMaritalStatus(patient.getMaritalStatus());

        dto.setOccupation(patient.getOccupation());
        dto.setNextOfKin(patient.getNextOfKin());
        dto.setNextOfKinRelationship(patient.getNextOfKinRelationship());
        dto.setNextOfKinPhone(patient.getNextOfKinPhone());
        dto.setPhone(patient.getPhone());
        dto.setAlternativePhone(patient.getAlternativePhone());
        dto.setPhoneOwner(patient.getPhoneOwner());
        dto.setOwnerName(patient.getOwnerName());
        dto.setPatientCategory(patient.getPatientCategory());
        dto.setCompany(patient.getCompany());
        dto.setPreferredLanguage(patient.getPreferredLanguage());
        dto.setCitizenship(patient.getCitizenship());
        dto.setCountryId(patient.getCountryId());
        dto.setForeignerOrRefugee(patient.getForeignerOrRefugee());
        dto.setNonUgandanNationalIdNo(patient.getNonUgandanNationalIdNo());
        dto.setResidence(patient.getResidence());
        dto.setResearchNumber(patient.getResearchNumber());
        dto.setReceptionTimestamp(patient.getReceptionTimestamp());
        dto.setReceivedBy(patient.getReceivedBy());
        
        // Get latest eye examination if available
        Optional<EyeExaminationDto> latestExamination = eyeExaminationService.getLatestEyeExamination(patient.getId());
        latestExamination.ifPresent(dto::setLatestEyeExamination);
        
        return dto;
    }

    private Patient toEntity(PatientDto dto) {
        Patient patient = new Patient();
        // Only set ID if it's not null (for updates, not creation)
        if (dto.getId() != null) {
            patient.setId(dto.getId());
        }
        // Only set patient number if it's not null (for updates, not creation)
        if (dto.getPatientNumber() != null) {
            patient.setPatientNumber(dto.getPatientNumber());
        }
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setGender(dto.getGender());
        patient.setNationalId(dto.getNationalId());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setAgeInYears(dto.getAgeInYears());
        patient.setAgeInMonths(dto.getAgeInMonths());
        patient.setMaritalStatus(dto.getMaritalStatus());

        patient.setOccupation(dto.getOccupation());
        patient.setNextOfKin(dto.getNextOfKin());
        patient.setNextOfKinRelationship(dto.getNextOfKinRelationship());
        patient.setNextOfKinPhone(dto.getNextOfKinPhone());
        patient.setPhone(dto.getPhone());
        patient.setAlternativePhone(dto.getAlternativePhone());
        patient.setPhoneOwner(dto.getPhoneOwner());
        patient.setOwnerName(dto.getOwnerName());
        patient.setPatientCategory(dto.getPatientCategory());
        patient.setCompany(dto.getCompany());
        patient.setPreferredLanguage(dto.getPreferredLanguage());
        patient.setCitizenship(dto.getCitizenship());
        patient.setCountryId(dto.getCountryId());
        patient.setForeignerOrRefugee(dto.getForeignerOrRefugee());
        patient.setNonUgandanNationalIdNo(dto.getNonUgandanNationalIdNo());
        patient.setResidence(dto.getResidence());
        patient.setResearchNumber(dto.getResearchNumber());
        patient.setReceptionTimestamp(dto.getReceptionTimestamp());
        patient.setReceivedBy(dto.getReceivedBy());
        return patient;
    }

    /**
     * Manually update the sequence to the highest patient ID
     */
    public int updateSequenceToHighestPatientId() {
        try {
            // Get the highest patient ID from non-deleted patients
            String maxIdSql = "SELECT COALESCE(MAX(id), 0) FROM patients WHERE deleted = false";
            Integer maxId = jdbcTemplate.queryForObject(maxIdSql, Integer.class);
            
            if (maxId == null || maxId == 0) {
                System.out.println("No patients found, setting sequence to 0");
                maxId = 0;
            }
            
            // Update the sequence
            String updateSql = "INSERT INTO patient_number_sequence (id, current_number) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET current_number = ?";
            jdbcTemplate.update(updateSql, maxId, maxId);
            
            System.out.println("Updated sequence to: " + maxId);
            System.out.println("Next patient number will be: ESP-" + String.format("%06d", maxId + 1));
            
            return maxId;
        } catch (Exception e) {
            System.err.println("Failed to update sequence: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Restore a soft-deleted patient
     */
    public void restorePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
        
        if (!patient.getDeleted()) {
            throw new RuntimeException("Patient is not deleted");
        }
        
        patient.setDeleted(false);
        patientRepository.save(patient);
        
        System.out.println("✅ Restored patient: " + patient.getPatientNumber() + " (" + patient.getFirstName() + " " + patient.getLastName() + ")");
        
        // Update sequence if the restored patient has a higher ID than current sequence
        updateSequenceAfterRestoration(patient.getId());
    }

    /**
     * Get all deleted patients
     */
    public Page<PatientDto> getDeletedPatients(Pageable pageable) {
        return patientRepository.findByDeletedTrue(pageable).map(this::toDto);
    }

    /**
     * Update sequence after patient deletion to reflect the new highest patient ID
     */
    private void updateSequenceAfterDeletion() {
        try {
            // Get the highest patient ID from non-deleted patients
            String maxIdSql = "SELECT COALESCE(MAX(id), 0) FROM patients WHERE deleted = false";
            Integer maxId = jdbcTemplate.queryForObject(maxIdSql, Integer.class);
            
            if (maxId == null || maxId == 0) {
                System.out.println("ℹ️ No non-deleted patients found, setting sequence to 0");
                maxId = 0;
            }
            
            // Update the sequence
            String updateSql = "INSERT INTO patient_number_sequence (id, current_number) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET current_number = ?";
            jdbcTemplate.update(updateSql, maxId, maxId);
            
            System.out.println("🔄 Updated sequence after deletion to: " + maxId);
            System.out.println("🎯 Next patient number will be: ESP-" + String.format("%06d", maxId + 1));
        } catch (Exception e) {
            System.err.println("❌ Failed to update sequence after deletion: " + e.getMessage());
        }
    }

    /**
     * Update sequence after patient restoration if the restored patient has a higher ID
     */
    private void updateSequenceAfterRestoration(Long restoredPatientId) {
        try {
            // Get current sequence value
            String currentSeqSql = "SELECT current_number FROM patient_number_sequence WHERE id = 1";
            Integer currentSequence = jdbcTemplate.queryForObject(currentSeqSql, Integer.class);
            
            if (currentSequence == null) {
                currentSequence = 0;
            }
            
            // If the restored patient has a higher ID than current sequence, update it
            if (restoredPatientId > currentSequence) {
                String updateSql = "INSERT INTO patient_number_sequence (id, current_number) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET current_number = ?";
                jdbcTemplate.update(updateSql, restoredPatientId.intValue(), restoredPatientId.intValue());
                
                System.out.println("🔄 Updated sequence after restoration to: " + restoredPatientId);
                System.out.println("🎯 Next patient number will be: ESP-" + String.format("%06d", restoredPatientId + 1));
            } else {
                System.out.println("ℹ️ Sequence not updated - restored patient ID (" + restoredPatientId + ") is not higher than current sequence (" + currentSequence + ")");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to update sequence after restoration: " + e.getMessage());
        }
    }
} 