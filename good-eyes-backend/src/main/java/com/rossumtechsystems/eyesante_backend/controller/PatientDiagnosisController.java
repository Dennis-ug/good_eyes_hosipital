package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreatePatientDiagnosisRequest;
import com.rossumtechsystems.eyesante_backend.dto.PatientDiagnosisDto;
import com.rossumtechsystems.eyesante_backend.service.PatientDiagnosisService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient-diagnoses")
@CrossOrigin(origins = "*")
public class PatientDiagnosisController {

    @Autowired
    private PatientDiagnosisService patientDiagnosisService;

    @GetMapping("/visit-session/{visitSessionId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<PatientDiagnosisDto>> getDiagnosesByVisitSession(@PathVariable Long visitSessionId) {
        List<PatientDiagnosisDto> diagnoses = patientDiagnosisService.getDiagnosesByVisitSession(visitSessionId);
        return ResponseEntity.ok(diagnoses);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<PatientDiagnosisDto>> getDiagnosesByPatient(@PathVariable Long patientId) {
        List<PatientDiagnosisDto> diagnoses = patientDiagnosisService.getDiagnosesByPatient(patientId);
        return ResponseEntity.ok(diagnoses);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientDiagnosisDto> createPatientDiagnosis(@Valid @RequestBody CreatePatientDiagnosisRequest request) {
        PatientDiagnosisDto diagnosis = patientDiagnosisService.createPatientDiagnosis(request);
        return ResponseEntity.ok(diagnosis);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientDiagnosisDto> updatePatientDiagnosis(@PathVariable Long id, @Valid @RequestBody CreatePatientDiagnosisRequest request) {
        PatientDiagnosisDto diagnosis = patientDiagnosisService.updatePatientDiagnosis(id, request);
        return ResponseEntity.ok(diagnosis);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deletePatientDiagnosis(@PathVariable Long id) {
        patientDiagnosisService.deletePatientDiagnosis(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientDiagnosisDto> getPatientDiagnosisById(@PathVariable Long id) {
        PatientDiagnosisDto diagnosis = patientDiagnosisService.getPatientDiagnosisById(id);
        return ResponseEntity.ok(diagnosis);
    }

    @GetMapping("/visit-session/{visitSessionId}/primary")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<PatientDiagnosisDto>> getPrimaryDiagnosesByVisitSession(@PathVariable Long visitSessionId) {
        List<PatientDiagnosisDto> diagnoses = patientDiagnosisService.getPrimaryDiagnosesByVisitSession(visitSessionId);
        return ResponseEntity.ok(diagnoses);
    }

    @GetMapping("/visit-session/{visitSessionId}/confirmed")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<PatientDiagnosisDto>> getConfirmedDiagnosesByVisitSession(@PathVariable Long visitSessionId) {
        List<PatientDiagnosisDto> diagnoses = patientDiagnosisService.getConfirmedDiagnosesByVisitSession(visitSessionId);
        return ResponseEntity.ok(diagnoses);
    }
}
