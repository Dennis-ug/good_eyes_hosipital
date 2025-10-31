package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreateEyeExaminationRequest;
import com.rossumtechsystems.eyesante_backend.dto.EyeExaminationDto;
import com.rossumtechsystems.eyesante_backend.dto.PatientDto;
import com.rossumtechsystems.eyesante_backend.service.OptometryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/optometry")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('OPTOMETRIST') or hasRole('OPHTHALMOLOGIST')")
public class OptometryController {

    @Autowired
    private OptometryService optometryService;

    @PostMapping("/examine-patient/{patientId}")
    public ResponseEntity<EyeExaminationDto> performEyeExamination(
            @PathVariable Long patientId,
            @Valid @RequestBody CreateEyeExaminationRequest examinationData) {
        EyeExaminationDto examination = optometryService.performEyeExamination(patientId, examinationData);
        return ResponseEntity.ok(examination);
    }

    @GetMapping("/patients-for-examination")
    public ResponseEntity<Page<PatientDto>> getPatientsForEyeExamination(Pageable pageable) {
        Page<PatientDto> patients = optometryService.getPatientsForEyeExamination(pageable);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients-with-diagnosis/{diagnosis}")
    public ResponseEntity<Page<EyeExaminationDto>> getPatientsWithDiagnosis(@PathVariable String diagnosis, Pageable pageable) {
        Page<EyeExaminationDto> examinations = optometryService.getPatientsWithDiagnosis(diagnosis, pageable);
        return ResponseEntity.ok(examinations);
    }
} 