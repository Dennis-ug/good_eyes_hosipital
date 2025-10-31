package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreateSurgeryReportRequest;
import com.rossumtechsystems.eyesante_backend.dto.SurgeryReportDto;
import com.rossumtechsystems.eyesante_backend.dto.UpdateSurgeryReportRequest;
import com.rossumtechsystems.eyesante_backend.service.SurgeryReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surgery-reports")
@CrossOrigin(origins = "*")
public class SurgeryReportController {

    @Autowired
    private SurgeryReportService surgeryReportService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SurgeryReportDto> createReport(@RequestBody CreateSurgeryReportRequest request) {
        return ResponseEntity.ok(surgeryReportService.createReport(request));
    }

    @GetMapping("/procedure/{patientProcedureId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<SurgeryReportDto>> getReportsByProcedure(@PathVariable Long patientProcedureId) {
        return ResponseEntity.ok(surgeryReportService.getReportsByProcedure(patientProcedureId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SurgeryReportDto> updateReport(@PathVariable Long id, @RequestBody UpdateSurgeryReportRequest request) {
        return ResponseEntity.ok(surgeryReportService.updateReport(id, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SurgeryReportDto> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(surgeryReportService.getReportById(id));
    }
}


