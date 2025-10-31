package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.TriageMeasurementDto;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession.VisitStage;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession.VisitStatus;
import com.rossumtechsystems.eyesante_backend.entity.TriageMeasurement;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import com.rossumtechsystems.eyesante_backend.repository.TriageMeasurementRepository;
import com.rossumtechsystems.eyesante_backend.exception.ResourceConflictException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TriageMeasurementService {

    private final TriageMeasurementRepository triageMeasurementRepository;
    private final PatientVisitSessionRepository patientVisitSessionRepository;

    /**
     * Create triage measurement
     */
    public TriageMeasurementDto createTriageMeasurement(TriageMeasurement triageMeasurement) {
        log.info("Creating triage measurement for visit session ID: {}", triageMeasurement.getVisitSession().getId());
        
        // Enforce one triage record per visit session
        if (triageMeasurement.getVisitSession() != null && triageMeasurement.getVisitSession().getId() != null) {
            Long visitSessionId = triageMeasurement.getVisitSession().getId();
            triageMeasurementRepository.findByVisitSessionId(visitSessionId)
                    .ifPresent(existing -> { throw new ResourceConflictException(
                            "Triage measurement already exists for visit session " + visitSessionId);
                    });
        }

        // Set measurement date if not provided
        if (triageMeasurement.getMeasurementDate() == null) {
            triageMeasurement.setMeasurementDate(LocalDateTime.now());
        }
        
        TriageMeasurement saved = triageMeasurementRepository.save(triageMeasurement);
        Optional<PatientVisitSession> patientVisitSession = patientVisitSessionRepository.findById(triageMeasurement.getVisitSession().getId());
        if (patientVisitSession.isPresent()) {
            patientVisitSession.get().setStatus(VisitStatus.TRIAGE_COMPLETED);
            patientVisitSession.get().setCurrentStage(VisitStage.BASIC_REFRACTION_EXAM);
            patientVisitSessionRepository.save(patientVisitSession.get());
        }
        
        // Fetch the saved entity with eager loading to avoid lazy loading issues
        return triageMeasurementRepository.findByIdWithPatient(saved.getId())
                .map(TriageMeasurementDto::new)
                .orElseThrow(() -> new RuntimeException("Failed to fetch created triage measurement"));
    }

    /**
     * Get triage measurement by ID
     */
    @Transactional(readOnly = true)
    public Optional<TriageMeasurementDto> getTriageMeasurementById(Long id) {
        log.info("Fetching triage measurement by ID: {}", id);
        return triageMeasurementRepository.findByIdWithPatient(id)
                .map(TriageMeasurementDto::new);
    }

    /**
     * Get triage measurement by visit session ID
     */
    @Transactional(readOnly = true)
    public Optional<TriageMeasurementDto> getTriageMeasurementByVisitSessionId(Long visitSessionId) {
        log.info("Fetching triage measurement for visit session ID: {}", visitSessionId);
        return triageMeasurementRepository.findByVisitSessionIdWithPatient(visitSessionId)
                .map(TriageMeasurementDto::new);
    }

    /**
     * Get all triage measurements
     */
    @Transactional(readOnly = true)
    public List<TriageMeasurementDto> getAllTriageMeasurements() {
        log.info("Fetching all triage measurements");
        return triageMeasurementRepository.findAllWithPatientDetails().stream()
                .map(TriageMeasurementDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Update triage measurement
     */
    public TriageMeasurementDto updateTriageMeasurement(Long id, TriageMeasurement triageMeasurement) {
        log.info("Updating triage measurement ID: {}", id);
        
        TriageMeasurement existing = triageMeasurementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Triage measurement not found with ID: " + id));
        
        // Update fields
        existing.setSystolicBp(triageMeasurement.getSystolicBp());
        existing.setDiastolicBp(triageMeasurement.getDiastolicBp());
        existing.setRbsValue(triageMeasurement.getRbsValue());
        existing.setRbsUnit(triageMeasurement.getRbsUnit());
        existing.setIopRight(triageMeasurement.getIopRight());
        existing.setIopLeft(triageMeasurement.getIopLeft());
        existing.setWeightKg(triageMeasurement.getWeightKg());
        existing.setWeightLbs(triageMeasurement.getWeightLbs());
        existing.setNotes(triageMeasurement.getNotes());
        existing.setMeasuredBy(triageMeasurement.getMeasuredBy());
        
        TriageMeasurement saved = triageMeasurementRepository.save(existing);
        
        // Fetch the updated entity with eager loading to avoid lazy loading issues
        return triageMeasurementRepository.findByIdWithPatient(saved.getId())
                .map(TriageMeasurementDto::new)
                .orElseThrow(() -> new RuntimeException("Failed to fetch updated triage measurement"));
    }

    /**
     * Delete triage measurement
     */
    public void deleteTriageMeasurement(Long id) {
        log.info("Deleting triage measurement ID: {}", id);
        
        if (!triageMeasurementRepository.existsById(id)) {
            throw new RuntimeException("Triage measurement not found with ID: " + id);
        }
        
        triageMeasurementRepository.deleteById(id);
    }
} 