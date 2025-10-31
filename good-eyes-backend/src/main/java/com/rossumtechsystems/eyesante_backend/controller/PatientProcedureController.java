package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreatePatientProcedureRequest;
import com.rossumtechsystems.eyesante_backend.dto.PatientProcedureDto;
import com.rossumtechsystems.eyesante_backend.service.PatientProcedureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patient-procedures")
@CrossOrigin(origins = "*")
public class PatientProcedureController {

    @Autowired
    private PatientProcedureService patientProcedureService;

    @GetMapping("/visit-session/{visitSessionId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<PatientProcedureDto>> getProceduresByVisitSession(@PathVariable Long visitSessionId) {
        List<PatientProcedureDto> procedures = patientProcedureService.getProceduresByVisitSession(visitSessionId);
        return ResponseEntity.ok(procedures);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientProcedureDto> createPatientProcedure(@RequestBody CreatePatientProcedureRequest request) {
        PatientProcedureDto createdProcedure = patientProcedureService.createPatientProcedure(request);
        return ResponseEntity.ok(createdProcedure);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientProcedureDto> updatePatientProcedure(@PathVariable Long id, @RequestBody CreatePatientProcedureRequest request) {
        PatientProcedureDto updatedProcedure = patientProcedureService.updatePatientProcedure(id, request);
        return ResponseEntity.ok(updatedProcedure);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deletePatientProcedure(@PathVariable Long id) {
        patientProcedureService.deletePatientProcedure(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientProcedureDto> getPatientProcedureById(@PathVariable Long id) {
        Optional<PatientProcedureDto> procedure = patientProcedureService.getPatientProcedureById(id);
        return procedure.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<PatientProcedureDto>> getPendingProcedures() {
        List<PatientProcedureDto> procedures = patientProcedureService.getPendingProcedures();
        return ResponseEntity.ok(procedures);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<PatientProcedureDto>> getAllProcedures() {
        List<PatientProcedureDto> procedures = patientProcedureService.getAllProcedures();
        return ResponseEntity.ok(procedures);
    }
}
