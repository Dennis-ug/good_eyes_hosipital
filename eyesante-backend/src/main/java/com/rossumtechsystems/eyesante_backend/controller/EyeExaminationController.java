package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreateEyeExaminationRequest;
import com.rossumtechsystems.eyesante_backend.dto.EyeExaminationDto;
import com.rossumtechsystems.eyesante_backend.service.EyeExaminationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eye-examinations")
@CrossOrigin(origins = "*")
public class EyeExaminationController {

    @Autowired
    private EyeExaminationService eyeExaminationService;

    @GetMapping
    @PreAuthorize("hasRole('OPTOMETRIST') or hasRole('OPHTHALMOLOGIST') or hasRole('SUPER_ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<Page<EyeExaminationDto>> getAllEyeExaminations(Pageable pageable) {
        Page<EyeExaminationDto> examinations = eyeExaminationService.getAllEyeExaminations(pageable);
        return ResponseEntity.ok(examinations);
    }

    @PostMapping
    @PreAuthorize("hasRole('OPTOMETRIST') or hasRole('OPHTHALMOLOGIST') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<EyeExaminationDto> createEyeExamination(@Valid @RequestBody CreateEyeExaminationRequest request) {
        EyeExaminationDto createdExamination = eyeExaminationService.createEyeExamination(request);
        return ResponseEntity.ok(createdExamination);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('OPTOMETRIST') or hasRole('OPHTHALMOLOGIST') or hasRole('SUPER_ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<Page<EyeExaminationDto>> getPatientEyeExaminations(@PathVariable Long patientId, Pageable pageable) {
        Page<EyeExaminationDto> examinations = eyeExaminationService.getPatientEyeExaminations(patientId, pageable);
        return ResponseEntity.ok(examinations);
    }

    @GetMapping("/patient/{patientId}/latest")
    @PreAuthorize("hasRole('OPTOMETRIST') or hasRole('OPHTHALMOLOGIST') or hasRole('SUPER_ADMIN') or hasRole('RECEPTIONIST')")
    public ResponseEntity<EyeExaminationDto> getLatestEyeExamination(@PathVariable Long patientId) {
        return eyeExaminationService.getLatestEyeExamination(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 