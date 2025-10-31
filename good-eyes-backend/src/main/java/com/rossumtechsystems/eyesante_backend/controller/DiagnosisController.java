package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.*;
import com.rossumtechsystems.eyesante_backend.service.DiagnosisService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnoses")
@CrossOrigin(origins = "*")
public class DiagnosisController {

    @Autowired
    private DiagnosisService diagnosisService;

    // Category Management
    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<DiagnosisCategoryDto>> getAllCategories() {
        List<DiagnosisCategoryDto> categories = diagnosisService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DiagnosisCategoryDto> createCategory(@Valid @RequestBody CreateDiagnosisCategoryRequest request) {
        DiagnosisCategoryDto category = diagnosisService.createCategory(request);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DiagnosisCategoryDto> getCategoryById(@PathVariable Long id) {
        DiagnosisCategoryDto category = diagnosisService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DiagnosisCategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody CreateDiagnosisCategoryRequest request) {
        DiagnosisCategoryDto category = diagnosisService.updateCategory(id, request);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        diagnosisService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // Diagnosis Management
    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<DiagnosisDto>> getAllDiagnoses(Pageable pageable) {
        Page<DiagnosisDto> diagnoses = diagnosisService.getAllDiagnoses(pageable);
        return ResponseEntity.ok(diagnoses);
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<DiagnosisDto>> getDiagnosesByCategory(@PathVariable Long categoryId) {
        List<DiagnosisDto> diagnoses = diagnosisService.getDiagnosesByCategory(categoryId);
        return ResponseEntity.ok(diagnoses);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DiagnosisDto> createDiagnosis(@Valid @RequestBody CreateDiagnosisRequest request) {
        DiagnosisDto diagnosis = diagnosisService.createDiagnosis(request);
        return ResponseEntity.ok(diagnosis);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DiagnosisDto> getDiagnosisById(@PathVariable Long id) {
        DiagnosisDto diagnosis = diagnosisService.getDiagnosisById(id);
        return ResponseEntity.ok(diagnosis);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DiagnosisDto> updateDiagnosis(@PathVariable Long id, @Valid @RequestBody CreateDiagnosisRequest request) {
        DiagnosisDto diagnosis = diagnosisService.updateDiagnosis(id, request);
        return ResponseEntity.ok(diagnosis);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteDiagnosis(@PathVariable Long id) {
        diagnosisService.deleteDiagnosis(id);
        return ResponseEntity.noContent().build();
    }

    // Search functionality
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<DiagnosisDto>> searchDiagnoses(@RequestParam String query) {
        List<DiagnosisDto> diagnoses = diagnosisService.searchDiagnoses(query);
        return ResponseEntity.ok(diagnoses);
    }
}
