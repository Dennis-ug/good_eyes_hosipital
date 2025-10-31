package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.entity.AppointmentType;
import com.rossumtechsystems.eyesante_backend.service.AppointmentTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointment-types")
@CrossOrigin(origins = "*")
public class AppointmentTypeController {

    @Autowired
    private AppointmentTypeService appointmentTypeService;

    // Create appointment type
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AppointmentType> createAppointmentType(@Valid @RequestBody AppointmentType appointmentType) {
        AppointmentType createdAppointmentType = appointmentTypeService.createAppointmentType(appointmentType);
        return ResponseEntity.ok(createdAppointmentType);
    }

    // Update appointment type
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AppointmentType> updateAppointmentType(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentType appointmentType) {
        AppointmentType updatedAppointmentType = appointmentTypeService.updateAppointmentType(id, appointmentType);
        return ResponseEntity.ok(updatedAppointmentType);
    }

    // Delete appointment type
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> deleteAppointmentType(@PathVariable Long id) {
        appointmentTypeService.deleteAppointmentType(id);
        return ResponseEntity.ok("Appointment type deleted successfully");
    }

    // Get appointment type by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<AppointmentType> getAppointmentTypeById(@PathVariable Long id) {
        AppointmentType appointmentType = appointmentTypeService.getAppointmentTypeById(id);
        return ResponseEntity.ok(appointmentType);
    }

    // Get appointment type by name
    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<AppointmentType> getAppointmentTypeByName(@PathVariable String name) {
        AppointmentType appointmentType = appointmentTypeService.getAppointmentTypeByName(name);
        return ResponseEntity.ok(appointmentType);
    }

    // Get all active appointment types
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentType>> getAllActiveAppointmentTypes() {
        List<AppointmentType> appointmentTypes = appointmentTypeService.getAllActiveAppointmentTypes();
        return ResponseEntity.ok(appointmentTypes);
    }

    // Get all appointment types
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentType>> getAllAppointmentTypes() {
        List<AppointmentType> appointmentTypes = appointmentTypeService.getAllAppointmentTypes();
        return ResponseEntity.ok(appointmentTypes);
    }

    // Get appointment types by active status
    @GetMapping("/status/{isActive}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentType>> getAppointmentTypesByActiveStatus(@PathVariable Boolean isActive) {
        List<AppointmentType> appointmentTypes = appointmentTypeService.getAppointmentTypesByActiveStatus(isActive);
        return ResponseEntity.ok(appointmentTypes);
    }

    // Search appointment types by name
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentType>> searchAppointmentTypesByName(@RequestParam String name) {
        List<AppointmentType> appointmentTypes = appointmentTypeService.searchAppointmentTypesByName(name);
        return ResponseEntity.ok(appointmentTypes);
    }

    // Get appointment types by insurance requirement
    @GetMapping("/insurance/{requiresInsurance}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentType>> getAppointmentTypesByInsuranceRequirement(@PathVariable Boolean requiresInsurance) {
        List<AppointmentType> appointmentTypes = appointmentTypeService.getAppointmentTypesByInsuranceRequirement(requiresInsurance);
        return ResponseEntity.ok(appointmentTypes);
    }

    // Get appointment types by prepayment requirement
    @GetMapping("/prepayment/{requiresPrepayment}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentType>> getAppointmentTypesByPrepaymentRequirement(@PathVariable Boolean requiresPrepayment) {
        List<AppointmentType> appointmentTypes = appointmentTypeService.getAppointmentTypesByPrepaymentRequirement(requiresPrepayment);
        return ResponseEntity.ok(appointmentTypes);
    }

    // Get appointment types by consultation requirement
    @GetMapping("/consultation/{requiresConsultation}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppointmentType>> getAppointmentTypesByConsultationRequirement(@PathVariable Boolean requiresConsultation) {
        List<AppointmentType> appointmentTypes = appointmentTypeService.getAppointmentTypesByConsultationRequirement(requiresConsultation);
        return ResponseEntity.ok(appointmentTypes);
    }

    // Toggle appointment type status
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> toggleAppointmentTypeStatus(@PathVariable Long id) {
        appointmentTypeService.toggleAppointmentTypeStatus(id);
        return ResponseEntity.ok("Appointment type status toggled successfully");
    }

    // Check if appointment type name exists
    @GetMapping("/exists/{name}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Boolean> checkAppointmentTypeNameExists(@PathVariable String name) {
        boolean exists = appointmentTypeService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
} 