package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreatePatientProcedureRequest;
import com.rossumtechsystems.eyesante_backend.dto.PatientProcedureDto;
import com.rossumtechsystems.eyesante_backend.entity.PatientProcedure;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.entity.Procedure;
import com.rossumtechsystems.eyesante_backend.repository.PatientProcedureRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import com.rossumtechsystems.eyesante_backend.repository.ProcedureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientProcedureService {
    
    @Autowired
    private PatientProcedureRepository patientProcedureRepository;
    
    @Autowired
    private PatientVisitSessionRepository patientVisitSessionRepository;
    
    @Autowired
    private ProcedureRepository procedureRepository;

    @Autowired
    private TimeService timeService;
    
    @Transactional(readOnly = true)
    public List<PatientProcedureDto> getProceduresByVisitSession(Long visitSessionId) {
        return patientProcedureRepository.findByVisitSessionId(visitSessionId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PatientProcedureDto createPatientProcedure(CreatePatientProcedureRequest request) {
        PatientVisitSession visitSession = patientVisitSessionRepository.findById(request.getVisitSessionId())
                .orElseThrow(() -> new RuntimeException("Visit session not found"));
        
        Procedure procedure = procedureRepository.findById(request.getProcedureId())
                .orElseThrow(() -> new RuntimeException("Procedure not found"));
        
        PatientProcedure patientProcedure = new PatientProcedure();
        patientProcedure.setVisitSession(visitSession);
        patientProcedure.setProcedure(procedure);
        patientProcedure.setEyeSide(PatientProcedure.EyeSide.valueOf(request.getEyeSide()));
        patientProcedure.setCost(request.getCost() != null ? request.getCost() : procedure.getPrice());
        patientProcedure.setPerformed(request.getPerformed() != null ? request.getPerformed() : false);
        patientProcedure.setPerformedBy(request.getPerformedBy());
        patientProcedure.setPerformedDate(request.getPerformed() ? timeService.getCurrentDateTime() : null);
        patientProcedure.setStaffFee(request.getStaffFee());
        patientProcedure.setNotes(request.getNotes());
        
        return toDto(patientProcedureRepository.save(patientProcedure));
    }
    
    @Transactional
    public PatientProcedureDto updatePatientProcedure(Long id, CreatePatientProcedureRequest request) {
        PatientProcedure patientProcedure = patientProcedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient procedure not found"));
        
        if (request.getProcedureId() != null) {
            Procedure procedure = procedureRepository.findById(request.getProcedureId())
                    .orElseThrow(() -> new RuntimeException("Procedure not found"));
            patientProcedure.setProcedure(procedure);
        }
        
        if (request.getEyeSide() != null) {
            patientProcedure.setEyeSide(PatientProcedure.EyeSide.valueOf(request.getEyeSide()));
        }
        
        if (request.getCost() != null) {
            patientProcedure.setCost(request.getCost());
        }
        
        if (request.getPerformed() != null) {
            patientProcedure.setPerformed(request.getPerformed());
            if (request.getPerformed()) {
                patientProcedure.setPerformedDate(timeService.getCurrentDateTime());
            }
        }
        
        if (request.getPerformedBy() != null) {
            patientProcedure.setPerformedBy(request.getPerformedBy());
        }
        
        if (request.getStaffFee() != null) {
            patientProcedure.setStaffFee(request.getStaffFee());
        }
        
        if (request.getNotes() != null) {
            patientProcedure.setNotes(request.getNotes());
        }
        
        return toDto(patientProcedureRepository.save(patientProcedure));
    }
    
    @Transactional
    public void deletePatientProcedure(Long id) {
        patientProcedureRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<PatientProcedureDto> getPatientProcedureById(Long id) {
        return patientProcedureRepository.findById(id)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<PatientProcedureDto> getPendingProcedures() {
        return patientProcedureRepository.findByPerformedFalse()
                .stream()
                .map(this::toDtoWithPatientInfo)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PatientProcedureDto> getAllProcedures() {
        return patientProcedureRepository.findAll()
                .stream()
                .map(this::toDtoWithPatientInfo)
                .collect(Collectors.toList());
    }
    
    private PatientProcedureDto toDto(PatientProcedure entity) {
        PatientProcedureDto dto = new PatientProcedureDto();
        dto.setId(entity.getId());
        dto.setVisitSessionId(entity.getVisitSession().getId());
        dto.setProcedureId(entity.getProcedure().getId());
        dto.setProcedureName(entity.getProcedure().getName());
        dto.setProcedureCategory(entity.getProcedure().getCategory());
        dto.setProcedurePrice(entity.getProcedure().getPrice());
        dto.setEyeSide(entity.getEyeSide().name());
        dto.setCost(entity.getCost());
        dto.setPerformed(entity.getPerformed());
        dto.setPerformedBy(entity.getPerformedBy());
        dto.setPerformedDate(entity.getPerformedDate());
        dto.setStaffFee(entity.getStaffFee());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private PatientProcedureDto toDtoWithPatientInfo(PatientProcedure entity) {
        PatientProcedureDto dto = toDto(entity);

        // Add patient information from visit session
        if (entity.getVisitSession() != null && entity.getVisitSession().getPatient() != null) {
            dto.setPatientName(entity.getVisitSession().getPatient().getFirstName() + " " +
                              entity.getVisitSession().getPatient().getLastName());
            dto.setPatientPhone(entity.getVisitSession().getPatient().getPhone() != null ?
                               entity.getVisitSession().getPatient().getPhone() :
                               entity.getVisitSession().getPatient().getAlternativePhone());
        } else {
            dto.setPatientName("Unknown Patient");
            dto.setPatientPhone("Phone not available");
        }

        return dto;
    }
}
