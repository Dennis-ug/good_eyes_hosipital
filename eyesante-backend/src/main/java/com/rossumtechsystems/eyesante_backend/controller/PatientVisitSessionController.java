package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreatePatientVisitSessionRequest;
import com.rossumtechsystems.eyesante_backend.dto.PatientVisitSessionDto;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.service.PatientVisitSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient-visit-sessions")
@RequiredArgsConstructor
@Slf4j
public class PatientVisitSessionController {

    private final PatientVisitSessionService patientVisitSessionService;

    /**
     * Create a new patient visit session
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> createVisitSession(@RequestBody CreatePatientVisitSessionRequest request) {
        log.info("Creating new patient visit session for patient ID: {}", request.getPatientId());
        PatientVisitSessionDto created = patientVisitSessionService.createVisitSession(request);
        return ResponseEntity.ok(created);
    }

    /**
     * Create a new patient visit session (legacy endpoint)
     */
    @PostMapping("/legacy")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> createVisitSessionLegacy(@RequestBody PatientVisitSession visitSession) {
        log.info("Creating new patient visit session (legacy) for patient ID: {}", 
                visitSession.getPatient() != null ? visitSession.getPatient().getId() : "null");
        PatientVisitSessionDto created = patientVisitSessionService.createVisitSession(visitSession);
        return ResponseEntity.ok(created);
    }

    /**
     * Get visit session by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN', 'USER')")
    public ResponseEntity<PatientVisitSessionDto> getVisitSessionById(@PathVariable Long id) {
        log.info("Fetching visit session by ID: {}", id);
        return patientVisitSessionService.getVisitSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all visit sessions
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN', 'USER')")
    public ResponseEntity<Page<PatientVisitSessionDto>> getAllVisitSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String search) {
        log.info("Fetching all visit sessions with page: {}, size: {}, search: {}", page, size, search);
        Page<PatientVisitSessionDto> sessions = patientVisitSessionService.getAllVisitSessions(page, size, search);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Get visit sessions by patient ID
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN', 'USER')")
    public ResponseEntity<List<PatientVisitSessionDto>> getVisitSessionsByPatientId(@PathVariable Long patientId) {
        log.info("Fetching visit sessions for patient ID: {}", patientId);
        List<PatientVisitSessionDto> sessions = patientVisitSessionService.getVisitSessionsByPatientId(patientId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Get visit sessions by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN', 'USER')")
    public ResponseEntity<List<PatientVisitSessionDto>> getVisitSessionsByStatus(@PathVariable String status) {
        log.info("Fetching visit sessions with status: {}", status);
        List<PatientVisitSessionDto> sessions = patientVisitSessionService.getVisitSessionsByStatus(status);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Get visit sessions by purpose
     */
    @GetMapping("/purpose/{purpose}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN', 'USER')")
    public ResponseEntity<List<PatientVisitSessionDto>> getVisitSessionsByPurpose(@PathVariable String purpose) {
        log.info("Fetching visit sessions with purpose: {}", purpose);
        List<PatientVisitSessionDto> sessions = patientVisitSessionService.getVisitSessionsByPurpose(purpose);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Update visit session
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> updateVisitSession(@PathVariable Long id, @RequestBody PatientVisitSession visitSession) {
        log.info("Updating visit session ID: {}", id);
        PatientVisitSessionDto updated = patientVisitSessionService.updateVisitSession(id, visitSession);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update visit session status
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> updateVisitSessionStatus(@PathVariable Long id, @RequestParam String status) {
        log.info("Updating visit session ID: {} status to: {}", id, status);
        PatientVisitSessionDto updated = patientVisitSessionService.updateVisitSessionStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Mark visit as completed
     */
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> completeVisitSession(@PathVariable Long id) {
        log.info("Completing visit session ID: {}", id);
        PatientVisitSessionDto completed = patientVisitSessionService.completeVisitSession(id);
        return ResponseEntity.ok(completed);
    }

    /**
     * Cancel visit session
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> cancelVisitSession(@PathVariable Long id, @RequestParam(required = false) String reason) {
        log.info("Cancelling visit session ID: {} with reason: {}", id, reason);
        PatientVisitSessionDto cancelled = patientVisitSessionService.cancelVisitSession(id, reason);
        return ResponseEntity.ok(cancelled);
    }

    /**
     * Mark visit as no-show
     */
    @PutMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> markVisitAsNoShow(@PathVariable Long id) {
        log.info("Marking visit session ID: {} as no-show", id);
        PatientVisitSessionDto noShow = patientVisitSessionService.markVisitAsNoShow(id);
        return ResponseEntity.ok(noShow);
    }

    /**
     * Mark consultation fee as paid
     */
    @PutMapping("/{id}/mark-fee-paid")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> markFeePaid(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String paymentMethod = request.get("paymentMethod");
        String paymentReference = request.get("paymentReference");
        log.info("Marking consultation fee as paid for visit session ID: {} with payment method: {}", id, paymentMethod);
        PatientVisitSessionDto updated = patientVisitSessionService.markConsultationFeePaid(id, paymentMethod, paymentReference);
        return ResponseEntity.ok(updated);
    }

    /**
     * Progress visit session to next stage
     */
    @PutMapping("/{id}/progress-stage")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PatientVisitSessionDto> progressStage(@PathVariable Long id) {
        log.info("Progressing visit session ID: {} to next stage", id);
        PatientVisitSessionDto updated = patientVisitSessionService.progressToNextStage(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete visit session
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Object> deleteVisitSession(@PathVariable Long id) {
        log.info("Deleting visit session ID: {}", id);
        patientVisitSessionService.deleteVisitSession(id);
        
        // Return a success message instead of void
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Visit session deleted successfully",
            "deletedId", id
        ));
    }

    /**
     * Get visit session statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Object> getVisitSessionStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        log.info("Fetching visit session statistics from {} to {}", startDate, endDate);
        Object statistics = patientVisitSessionService.getVisitSessionStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    /**
     * Search visit sessions
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN', 'USER')")
    public ResponseEntity<List<PatientVisitSessionDto>> searchVisitSessions(
            @RequestParam(required = false) String patientName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String purpose,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        log.info("Searching visit sessions with filters: patientName={}, status={}, purpose={}, startDate={}, endDate={}", 
                patientName, status, purpose, startDate, endDate);
        List<PatientVisitSessionDto> sessions = patientVisitSessionService.searchVisitSessions(patientName, status, purpose, startDate, endDate);
        return ResponseEntity.ok(sessions);
    }
} 