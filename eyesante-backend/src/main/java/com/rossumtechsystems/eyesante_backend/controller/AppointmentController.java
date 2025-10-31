package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.AppointmentDto;
import com.rossumtechsystems.eyesante_backend.dto.CreateInvoiceFromItemsRequest;
import com.rossumtechsystems.eyesante_backend.dto.BatchAvailabilityRequest;
import com.rossumtechsystems.eyesante_backend.dto.CreateAppointmentRequest;
import com.rossumtechsystems.eyesante_backend.dto.InvoiceDto;
import com.rossumtechsystems.eyesante_backend.dto.UpdateAppointmentRequest;
import com.rossumtechsystems.eyesante_backend.entity.Appointment;
import com.rossumtechsystems.eyesante_backend.service.AppointmentService;
import com.rossumtechsystems.eyesante_backend.service.FinanceService;
import com.rossumtechsystems.eyesante_backend.util.TimeUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private FinanceService financeService;

    // Create appointment
    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<AppointmentDto> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentDto appointment = appointmentService.createAppointment(request);
        return ResponseEntity.ok(appointment);
    }

    // Update appointment (partial update)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<AppointmentDto> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAppointmentRequest request) {
        AppointmentDto appointment = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(appointment);
    }

    // Soft delete appointment
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        // Get authenticated user for audit
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "system";
        appointmentService.softDeleteAppointment(id, username);
        return ResponseEntity.noContent().build();
    }

    // Get appointment by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable Long id) {
        AppointmentDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    // Get all appointments (paginated)
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Page<AppointmentDto>> getAllAppointments(Pageable pageable) {
        Page<AppointmentDto> appointments = appointmentService.getAllAppointments(pageable);
        return ResponseEntity.ok(appointments);
    }

    // Get appointments by doctor
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Page<AppointmentDto>> getAppointmentsByDoctor(
            @PathVariable Long doctorId, 
            Pageable pageable) {
        Page<AppointmentDto> appointments = appointmentService.getAppointmentsByDoctor(doctorId, pageable);
        return ResponseEntity.ok(appointments);
    }

    // Get appointments by patient
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Page<AppointmentDto>> getAppointmentsByPatient(
            @PathVariable Long patientId, 
            Pageable pageable) {
        Page<AppointmentDto> appointments = appointmentService.getAppointmentsByPatient(patientId, pageable);
        return ResponseEntity.ok(appointments);
    }

    // Get appointments by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Page<AppointmentDto>> getAppointmentsByStatus(
            @PathVariable Appointment.AppointmentStatus status, 
            Pageable pageable) {
        Page<AppointmentDto> appointments = appointmentService.getAppointmentsByStatus(status, pageable);
        return ResponseEntity.ok(appointments);
    }

    // Get appointments by date range
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Page<AppointmentDto>> getAppointmentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<AppointmentDto> appointments = appointmentService.getAppointmentsByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(appointments);
    }

    // Get today's appointments
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentDto>> getTodayAppointments() {
        List<AppointmentDto> appointments = appointmentService.getTodayAppointments();
        return ResponseEntity.ok(appointments);
    }

    // Update appointment status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<AppointmentDto> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam Appointment.AppointmentStatus status) {
        AppointmentDto appointment = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(appointment);
    }

    // Cancel appointment
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<AppointmentDto> cancelAppointment(
            @PathVariable Long id,
            @RequestParam String cancellationReason) {
        AppointmentDto appointment = appointmentService.cancelAppointment(id, cancellationReason);
        return ResponseEntity.ok(appointment);
    }

    // Reschedule appointment
    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<AppointmentDto> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) String newTime) {
        // Parse time string to LocalTime using utility method
        LocalTime localTime = TimeUtils.parseTime(newTime);
        AppointmentDto appointment = appointmentService.rescheduleAppointment(id, newDate, localTime);
        return ResponseEntity.ok(appointment);
    }

    // Check doctor availability
    @GetMapping("/doctor/{doctorId}/availability")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Boolean> checkDoctorAvailability(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) String startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) String endTime) {
        LocalTime start = TimeUtils.parseTime(startTime);
        LocalTime end = TimeUtils.parseTime(endTime);
        String availabilityError = appointmentService.checkDoctorAvailability(doctorId, date, start, end);
        boolean available = availabilityError == null;
        return ResponseEntity.ok(available);
    }

    // Get appointments needing reminders
    @GetMapping("/reminders/needed")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsNeedingReminders() {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsNeedingReminders();
        return ResponseEntity.ok(appointments);
    }

    // Send reminders
    @PostMapping("/reminders/send")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'SUPER_ADMIN')")
    public ResponseEntity<String> sendReminders() {
        appointmentService.sendReminders();
        return ResponseEntity.ok("Reminders sent successfully");
    }

    // Check for appointment conflicts
    @GetMapping("/conflicts/check")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Boolean> checkConflicts(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) String startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) String endTime) {
        LocalTime start = TimeUtils.parseTime(startTime);
        LocalTime end = TimeUtils.parseTime(endTime);
        String availabilityError = appointmentService.checkDoctorAvailability(doctorId, date, start, end);
        boolean hasConflicts = availabilityError != null;
        return ResponseEntity.ok(hasConflicts);
    }

    // Check batch availability for multiple time slots
    @PostMapping("/availability/batch-check")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkBatchAvailability(@RequestBody BatchAvailabilityRequest request) {
        Map<String, Boolean> results = new HashMap<>();
        
        for (String timeSlot : request.getTimeSlots()) {
            LocalTime start = TimeUtils.parseTime(timeSlot);
            LocalTime end = start.plusMinutes(request.getDuration());
            String availabilityError = appointmentService.checkDoctorAvailability(request.getDoctorId(), request.getDate(), start, end);
            boolean available = availabilityError == null;
            results.put(timeSlot, available);
        }
        
        return ResponseEntity.ok(results);
    }

    // Create invoice from procedures for a visit session
    @PostMapping("/visit-sessions/{visitSessionId}/create-invoice-from-procedures")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> createInvoiceFromProcedures(@PathVariable Long visitSessionId) {
        // Get the authenticated user's username
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();
        
        InvoiceDto invoice = financeService.createInvoiceFromProcedures(visitSessionId, authenticatedUsername);
        return ResponseEntity.ok(invoice);
    }

    // Create invoice from treatments for a visit session
    @PostMapping("/visit-sessions/{visitSessionId}/create-invoice-from-treatments")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> createInvoiceFromTreatments(@PathVariable Long visitSessionId) {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        InvoiceDto invoice = financeService.createInvoiceFromTreatments(visitSessionId, authenticatedUsername);
        return ResponseEntity.ok(invoice);
    }

    // Create invoice from investigations for a visit session
    @PostMapping("/visit-sessions/{visitSessionId}/create-invoice-from-investigations")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> createInvoiceFromInvestigations(@PathVariable Long visitSessionId) {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        InvoiceDto invoice = financeService.createInvoiceFromInvestigations(visitSessionId, authenticatedUsername);
        return ResponseEntity.ok(invoice);
    }

    // Create invoice from selected inventory items for a visit session (optics or other)
    @PostMapping("/visit-sessions/{visitSessionId}/create-invoice-from-items")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> createInvoiceFromItems(
            @PathVariable Long visitSessionId,
            @RequestBody List<CreateInvoiceFromItemsRequest> itemSelections
    ) {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        InvoiceDto invoice = financeService.createInvoiceFromInventoryItems(visitSessionId, authenticatedUsername, itemSelections);
        return ResponseEntity.ok(invoice);
    }

} 