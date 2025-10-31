package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.PatientDto;
import com.rossumtechsystems.eyesante_backend.service.ReceptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reception")
// @CrossOrigin(origins = "*")
// @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('SUPER_ADMIN')")
public class ReceptionController {

    @Autowired
    private ReceptionService receptionService;

    // @Autowired
    // private PatientService patientService;

    @PostMapping("/receive-new-patient")
    public ResponseEntity<PatientDto> receiveNewPatient(@Valid @RequestBody PatientDto patientDto) {
        PatientDto receivedPatient = receptionService.receiveNewPatient(patientDto);
        return ResponseEntity.ok(receivedPatient);
    }

    @PostMapping("/receive-returning-patient/{patientId}")
    public ResponseEntity<PatientDto> receiveReturningPatient(@PathVariable Long patientId) {
        PatientDto receivedPatient = receptionService.receiveReturningPatient(patientId);
        return ResponseEntity.ok(receivedPatient);
    }

    @GetMapping("/patients-received-today")
    public ResponseEntity<Page<PatientDto>> getPatientsReceivedToday(Pageable pageable) {
        Page<PatientDto> patients = receptionService.getPatientsReceivedToday(pageable);
        return ResponseEntity.ok(patients);
    }
} 