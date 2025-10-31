package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.PatientDto;
import com.rossumtechsystems.eyesante_backend.entity.Patient;
import com.rossumtechsystems.eyesante_backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReceptionService {
    @Autowired
    private PatientRepository patientRepository;

    // @Autowired
    // private DepartmentRepository departmentRepository;


    @Autowired
    private PatientService patientService;

    public PatientDto receiveNewPatient(PatientDto patientDto) {
        // Set reception timestamp
        patientDto.setReceptionTimestamp(LocalDateTime.now());
        
        // Get current logged-in user
        String currentUsername = getCurrentUsername();
        patientDto.setReceivedBy(currentUsername);

        // Use PatientService to create patient with proper patient number generation
        // This ensures patient numbers are generated correctly
        return patientService.createPatient(patientDto);
    }

    public PatientDto receiveReturningPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Update reception timestamp for returning patient
        patient.setReceptionTimestamp(LocalDateTime.now());
        
        // Get current logged-in user
        String currentUsername = getCurrentUsername();
        patient.setReceivedBy(currentUsername);

        Patient savedPatient = patientRepository.save(patient);
        return toDto(savedPatient);
    }

    public Page<PatientDto> getPatientsReceivedToday(Pageable pageable) {
        // LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        // LocalDateTime endOfDay = startOfDay.plusDays(1);

        // This would need a custom query in PatientRepository
        // For now, return all patients with pagination
        return patientRepository.findAll(pageable).map(this::toDto);
    }




    private PatientDto toDto(Patient patient) {
        PatientDto dto = new PatientDto();
        dto.setId(patient.getId());
        dto.setPatientNumber(patient.getPatientNumber()); // Include patient number
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
        return dto;
    }

    /**
     * Get the current logged-in user's username
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getName())) {
            return "system"; // Fallback for unauthenticated requests
        }
        return authentication.getName();
    }
} 