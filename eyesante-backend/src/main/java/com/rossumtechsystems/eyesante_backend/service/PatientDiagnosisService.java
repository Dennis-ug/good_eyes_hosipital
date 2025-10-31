package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreatePatientDiagnosisRequest;
import com.rossumtechsystems.eyesante_backend.dto.PatientDiagnosisDto;
import com.rossumtechsystems.eyesante_backend.entity.Diagnosis;
import com.rossumtechsystems.eyesante_backend.entity.PatientDiagnosis;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.repository.DiagnosisRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientDiagnosisRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientDiagnosisService {

    @Autowired
    private PatientDiagnosisRepository patientDiagnosisRepository;

    @Autowired
    private PatientVisitSessionRepository visitSessionRepository;

    @Autowired
    private DiagnosisRepository diagnosisRepository;

    public List<PatientDiagnosisDto> getDiagnosesByVisitSession(Long visitSessionId) {
        List<PatientDiagnosis> patientDiagnoses = patientDiagnosisRepository.findByVisitSessionIdOrderByDiagnosisDateDesc(visitSessionId);
        return patientDiagnoses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PatientDiagnosisDto> getDiagnosesByPatient(Long patientId) {
        List<PatientDiagnosis> patientDiagnoses = patientDiagnosisRepository.findByPatientIdOrderByDiagnosisDateDesc(patientId);
        return patientDiagnoses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PatientDiagnosisDto createPatientDiagnosis(CreatePatientDiagnosisRequest request) {
        // Validate visit session exists
        PatientVisitSession visitSession = visitSessionRepository.findById(request.getVisitSessionId())
                .orElseThrow(() -> new RuntimeException("Visit session not found"));

        // Validate diagnosis exists
        Diagnosis diagnosis = diagnosisRepository.findById(request.getDiagnosisId())
                .orElseThrow(() -> new RuntimeException("Diagnosis not found"));

        // Create patient diagnosis
        PatientDiagnosis patientDiagnosis = new PatientDiagnosis();
        patientDiagnosis.setVisitSession(visitSession);
        patientDiagnosis.setDiagnosis(diagnosis);
        patientDiagnosis.setDiagnosisDate(LocalDateTime.now());
        patientDiagnosis.setSeverity(PatientDiagnosis.DiagnosisSeverity.valueOf(request.getSeverity() != null ? request.getSeverity() : "MILD"));
        patientDiagnosis.setNotes(request.getNotes());
        patientDiagnosis.setIsPrimaryDiagnosis(request.getIsPrimaryDiagnosis() != null ? request.getIsPrimaryDiagnosis() : false);
        patientDiagnosis.setIsConfirmed(request.getIsConfirmed() != null ? request.getIsConfirmed() : false);
        patientDiagnosis.setDiagnosedBy(request.getDiagnosedBy());
        if (request.getEyeSide() != null && !request.getEyeSide().isEmpty()) {
            try {
                patientDiagnosis.setEyeSide(PatientDiagnosis.EyeSide.valueOf(request.getEyeSide()));
            } catch (IllegalArgumentException ignored) {}
        }

        PatientDiagnosis saved = patientDiagnosisRepository.save(patientDiagnosis);
        return convertToDto(saved);
    }

    public PatientDiagnosisDto updatePatientDiagnosis(Long id, CreatePatientDiagnosisRequest request) {
        PatientDiagnosis patientDiagnosis = patientDiagnosisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient diagnosis not found"));

        // Update fields
        if (request.getSeverity() != null) {
            patientDiagnosis.setSeverity(PatientDiagnosis.DiagnosisSeverity.valueOf(request.getSeverity()));
        }
        if (request.getNotes() != null) {
            patientDiagnosis.setNotes(request.getNotes());
        }
        if (request.getIsPrimaryDiagnosis() != null) {
            patientDiagnosis.setIsPrimaryDiagnosis(request.getIsPrimaryDiagnosis());
        }
        if (request.getIsConfirmed() != null) {
            patientDiagnosis.setIsConfirmed(request.getIsConfirmed());
        }
        if (request.getDiagnosedBy() != null) {
            patientDiagnosis.setDiagnosedBy(request.getDiagnosedBy());
        }
        if (request.getEyeSide() != null && !request.getEyeSide().isEmpty()) {
            try {
                patientDiagnosis.setEyeSide(PatientDiagnosis.EyeSide.valueOf(request.getEyeSide()));
            } catch (IllegalArgumentException ignored) {}
        }

        PatientDiagnosis saved = patientDiagnosisRepository.save(patientDiagnosis);
        return convertToDto(saved);
    }

    public void deletePatientDiagnosis(Long id) {
        if (!patientDiagnosisRepository.existsById(id)) {
            throw new RuntimeException("Patient diagnosis not found");
        }
        patientDiagnosisRepository.deleteById(id);
    }

    public PatientDiagnosisDto getPatientDiagnosisById(Long id) {
        PatientDiagnosis patientDiagnosis = patientDiagnosisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient diagnosis not found"));
        return convertToDto(patientDiagnosis);
    }

    public List<PatientDiagnosisDto> getPrimaryDiagnosesByVisitSession(Long visitSessionId) {
        List<PatientDiagnosis> primaryDiagnoses = patientDiagnosisRepository.findPrimaryDiagnosesByVisitSessionId(visitSessionId);
        return primaryDiagnoses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PatientDiagnosisDto> getConfirmedDiagnosesByVisitSession(Long visitSessionId) {
        List<PatientDiagnosis> confirmedDiagnoses = patientDiagnosisRepository.findConfirmedDiagnosesByVisitSessionId(visitSessionId);
        return confirmedDiagnoses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private PatientDiagnosisDto convertToDto(PatientDiagnosis patientDiagnosis) {
        PatientDiagnosisDto dto = new PatientDiagnosisDto();
        dto.setId(patientDiagnosis.getId());
        dto.setVisitSessionId(patientDiagnosis.getVisitSession().getId());
        
        // Convert diagnosis to DTO
        com.rossumtechsystems.eyesante_backend.dto.DiagnosisDto diagnosisDto = new com.rossumtechsystems.eyesante_backend.dto.DiagnosisDto();
        diagnosisDto.setId(patientDiagnosis.getDiagnosis().getId());
        diagnosisDto.setName(patientDiagnosis.getDiagnosis().getName());
        diagnosisDto.setDescription(patientDiagnosis.getDiagnosis().getDescription());
        diagnosisDto.setCategoryId(patientDiagnosis.getDiagnosis().getCategory().getId());
        diagnosisDto.setCategoryName(patientDiagnosis.getDiagnosis().getCategory().getName());
        diagnosisDto.setCreatedAt(patientDiagnosis.getDiagnosis().getCreatedAt());
        diagnosisDto.setUpdatedAt(patientDiagnosis.getDiagnosis().getUpdatedAt());
        dto.setDiagnosis(diagnosisDto);
        
        dto.setDiagnosisDate(patientDiagnosis.getDiagnosisDate());
        dto.setSeverity(patientDiagnosis.getSeverity() != null ? patientDiagnosis.getSeverity().name() : null);
        dto.setNotes(patientDiagnosis.getNotes());
        dto.setIsPrimaryDiagnosis(patientDiagnosis.getIsPrimaryDiagnosis());
        dto.setIsConfirmed(patientDiagnosis.getIsConfirmed());
        dto.setDiagnosedBy(patientDiagnosis.getDiagnosedBy());
        dto.setEyeSide(patientDiagnosis.getEyeSide() != null ? patientDiagnosis.getEyeSide().name() : null);
        dto.setCreatedAt(patientDiagnosis.getCreatedAt());
        dto.setUpdatedAt(patientDiagnosis.getUpdatedAt());
        
        return dto;
    }
}
