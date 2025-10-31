package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreatePatientInvestigationRequest;
import com.rossumtechsystems.eyesante_backend.dto.PatientInvestigationDto;
import com.rossumtechsystems.eyesante_backend.entity.InvestigationType;
import com.rossumtechsystems.eyesante_backend.entity.PatientInvestigation;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.repository.InvestigationTypeRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientInvestigationRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient-investigations")
@CrossOrigin(origins = "*")
public class PatientInvestigationController {

    @Autowired
    private PatientInvestigationRepository repository;

    @Autowired
    private PatientVisitSessionRepository visitSessionRepository;

    @Autowired
    private InvestigationTypeRepository typeRepository;

    @GetMapping("/visit-session/{visitSessionId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR','ACCOUNTANT','ACCOUNT_STORE_MANAGER','SUPER_ADMIN')")
    public ResponseEntity<List<PatientInvestigationDto>> getByVisitSession(
            @PathVariable Long visitSessionId,
            @RequestParam(name = "includeBilled", required = false, defaultValue = "false") boolean includeBilled,
            @RequestParam(name = "todayOnly", required = false, defaultValue = "true") boolean todayOnly) {
        List<PatientInvestigation> entities;
        if (includeBilled) {
            entities = repository.findByVisitSessionId(visitSessionId);
        } else if (todayOnly) {
            entities = repository.findUnbilledCreatedOnDate(visitSessionId, LocalDate.now());
        } else {
            entities = repository.findUnbilledByVisitSession(visitSessionId);
        }

        List<PatientInvestigationDto> list = entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR','ACCOUNTANT','ACCOUNT_STORE_MANAGER','SUPER_ADMIN')")
    public ResponseEntity<PatientInvestigationDto> create(@RequestBody CreatePatientInvestigationRequest request) {
        PatientVisitSession vs = visitSessionRepository.findById(request.getVisitSessionId())
                .orElseThrow(() -> new RuntimeException("Visit session not found: " + request.getVisitSessionId()));
        InvestigationType type = typeRepository.findById(request.getInvestigationTypeId())
                .orElseThrow(() -> new RuntimeException("Investigation type not found: " + request.getInvestigationTypeId()));

        PatientInvestigation entity = new PatientInvestigation();
        entity.setVisitSession(vs);
        entity.setInvestigationType(type);
        if (request.getEyeSide() != null) {
            entity.setEyeSide(PatientInvestigation.EyeSide.valueOf(request.getEyeSide()));
        }
        entity.setQuantity(request.getQuantity() == null ? 1 : request.getQuantity());
        entity.setCost(request.getCost());
        entity.setNotes(request.getNotes());

        PatientInvestigation saved = repository.save(entity);
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR','ACCOUNTANT','ACCOUNT_STORE_MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private PatientInvestigationDto toDto(PatientInvestigation pi) {
        PatientInvestigationDto dto = new PatientInvestigationDto();
        dto.setId(pi.getId());
        dto.setVisitSessionId(pi.getVisitSession().getId());
        dto.setInvestigationTypeId(pi.getInvestigationType().getId());
        dto.setInvestigationName(pi.getInvestigationType().getName());
        dto.setEyeSide(pi.getEyeSide() != null ? pi.getEyeSide().name() : null);
        dto.setQuantity(pi.getQuantity());
        dto.setCost(pi.getCost());
        dto.setNotes(pi.getNotes());
        return dto;
    }
}


