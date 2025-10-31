package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreateEyeExaminationRequest;
import com.rossumtechsystems.eyesante_backend.dto.EyeExaminationDto;
import com.rossumtechsystems.eyesante_backend.dto.PatientDto;
import com.rossumtechsystems.eyesante_backend.entity.Patient;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.PatientRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class OptometryService {
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EyeExaminationService eyeExaminationService;

    public EyeExaminationDto performEyeExamination(Long patientId, CreateEyeExaminationRequest examinationData) {
        // Check if current user is from Optometry department
        User currentUser = getCurrentUser();
        if (!isOptometryUser(currentUser)) {
            throw new AccessDeniedException("Only optometry staff can perform eye examinations");
        }

        // Verify patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Set examiner information
        examinationData.setPatientId(patientId);
        examinationData.setExaminerId(currentUser.getId());
        examinationData.setExaminerName(currentUser.getFirstName() + " " + currentUser.getLastName());

        // Create eye examination record
        return eyeExaminationService.createEyeExamination(examinationData);
    }

    public Page<PatientDto> getPatientsForEyeExamination(Pageable pageable) {
        User currentUser = getCurrentUser();
        if (!isOptometryUser(currentUser)) {
            throw new AccessDeniedException("Only optometry staff can view patient lists");
        }

        // Get all patients (they can all be examined) with pagination
        return patientRepository.findAll(pageable).map(this::toDto);
    }

    public Page<EyeExaminationDto> getPatientsWithDiagnosis(String diagnosis, Pageable pageable) {
        User currentUser = getCurrentUser();
        if (!isOptometryUser(currentUser)) {
            throw new AccessDeniedException("Only optometry staff can view patient lists");
        }

        // Get examinations with the specific diagnosis with pagination
        return eyeExaminationService.getExaminationsByDiagnosis(diagnosis, pageable);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean isOptometryUser(User user) {
        return user.getDepartment() != null && 
               ("Optometry".equals(user.getDepartment().getName()) || 
                "Ophthalmology".equals(user.getDepartment().getName()));
    }

    private PatientDto toDto(Patient patient) {
        PatientDto dto = new PatientDto();
        dto.setId(patient.getId());
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
        
        return dto;
    }
} 