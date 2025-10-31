package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.TriageMeasurementDto;
import com.rossumtechsystems.eyesante_backend.entity.TriageMeasurement;
import com.rossumtechsystems.eyesante_backend.service.TriageMeasurementService;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/triage-measurements")
@RequiredArgsConstructor
@Slf4j
public class TriageMeasurementController {

    private final TriageMeasurementService triageMeasurementService;
    private final PatientVisitSessionRepository patientVisitSessionRepository;

    /**
     * Create triage measurement
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TriageMeasurementDto> createTriageMeasurement(@RequestBody TriageMeasurementDto triageMeasurementDto) {
        log.info("Creating triage measurement for visit session ID: {}", triageMeasurementDto.getVisitSessionId());
        
        // Convert DTO to entity
        TriageMeasurement triageMeasurement = convertDtoToEntity(triageMeasurementDto);
        
        TriageMeasurementDto created = triageMeasurementService.createTriageMeasurement(triageMeasurement);
        return ResponseEntity.ok(created);
    }

    /**
     * Get triage measurement by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TriageMeasurementDto> getTriageMeasurementById(@PathVariable Long id) {
        log.info("Fetching triage measurement by ID: {}", id);
        Optional<TriageMeasurementDto> measurement = triageMeasurementService.getTriageMeasurementById(id);
        return measurement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get triage measurement by visit session ID
     */
    @GetMapping("/visit-session/{visitSessionId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TriageMeasurementDto> getTriageMeasurementByVisitSessionId(@PathVariable Long visitSessionId) {
        log.info("Fetching triage measurement for visit session ID: {}", visitSessionId);
        Optional<TriageMeasurementDto> measurement = triageMeasurementService.getTriageMeasurementByVisitSessionId(visitSessionId);
        return measurement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all triage measurements
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TriageMeasurementDto>> getAllTriageMeasurements() {
        log.info("Fetching all triage measurements");
        List<TriageMeasurementDto> measurements = triageMeasurementService.getAllTriageMeasurements();
        return ResponseEntity.ok(measurements);
    }

    /**
     * Update triage measurement
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TriageMeasurementDto> updateTriageMeasurement(@PathVariable Long id, @RequestBody TriageMeasurementDto triageMeasurementDto) {
        log.info("Updating triage measurement ID: {}", id);
        
        // Convert DTO to entity
        TriageMeasurement triageMeasurement = convertDtoToEntity(triageMeasurementDto);
        
        TriageMeasurementDto updated = triageMeasurementService.updateTriageMeasurement(id, triageMeasurement);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete triage measurement
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteTriageMeasurement(@PathVariable Long id) {
        log.info("Deleting triage measurement ID: {}", id);
        triageMeasurementService.deleteTriageMeasurement(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Convert DTO to entity with proper relationship mapping
     */
    private TriageMeasurement convertDtoToEntity(TriageMeasurementDto dto) {
        TriageMeasurement entity = new TriageMeasurement();
        
        // Set visit session relationship
        if (dto.getVisitSessionId() != null) {
            var visitSession = patientVisitSessionRepository.findById(dto.getVisitSessionId())
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + dto.getVisitSessionId()));
            entity.setVisitSession(visitSession);
        }
        
        // Set other fields
        entity.setSystolicBp(dto.getSystolicBp());
        entity.setDiastolicBp(dto.getDiastolicBp());
        entity.setRbsValue(dto.getRbsValue() != null ? java.math.BigDecimal.valueOf(dto.getRbsValue()) : null);
        entity.setRbsUnit(dto.getRbsUnit());
        entity.setIopRight(dto.getIopRight());
        entity.setIopLeft(dto.getIopLeft());
        entity.setWeightKg(dto.getWeightKg() != null ? java.math.BigDecimal.valueOf(dto.getWeightKg()) : null);
        entity.setWeightLbs(dto.getWeightLbs() != null ? java.math.BigDecimal.valueOf(dto.getWeightLbs()) : null);
        entity.setNotes(dto.getNotes());
        entity.setMeasuredBy(dto.getMeasuredBy());
        entity.setMeasurementDate(dto.getMeasurementDate());
        
        return entity;
    }
} 