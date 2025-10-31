package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.PatientTreatmentDto;
import com.rossumtechsystems.eyesante_backend.entity.InventoryItem;
import com.rossumtechsystems.eyesante_backend.entity.PatientTreatment;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.repository.InventoryItemRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientTreatmentRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient-treatments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PatientTreatmentController {

    private final PatientTreatmentRepository patientTreatmentRepository;

    private final PatientVisitSessionRepository patientVisitSessionRepository;

    private final InventoryItemRepository inventoryItemRepository;

    @GetMapping("/visit-session/{visitSessionId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR','ACCOUNTANT','ACCOUNT_STORE_MANAGER','SUPER_ADMIN')")
    public ResponseEntity<List<PatientTreatmentDto>> getByVisitSession(@PathVariable Long visitSessionId) {
        List<PatientTreatmentDto> list = patientTreatmentRepository.findByVisitSessionId(visitSessionId)
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR','ACCOUNTANT','ACCOUNT_STORE_MANAGER','SUPER_ADMIN')")
    public ResponseEntity<PatientTreatmentDto> create(@RequestBody PatientTreatmentDto dto) {
        PatientVisitSession vs = patientVisitSessionRepository.findById(dto.getVisitSessionId())
                .orElseThrow(() -> new RuntimeException("Visit session not found: " + dto.getVisitSessionId()));
        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new RuntimeException("Inventory item not found: " + dto.getInventoryItemId()));

        // Merge with existing treatment item for same inventory item within the visit session
        PatientTreatment entity = patientTreatmentRepository
                .findByVisitSessionIdAndInventoryItemId(vs.getId(), item.getId())
                .map(existing -> {
                    int incomingQty = dto.getQuantity() == null ? 1 : dto.getQuantity();
                    existing.setQuantity((existing.getQuantity() == null ? 0 : existing.getQuantity()) + incomingQty);
                    // Optionally update dosage/route if supplied
                    if (dto.getDosage() != null && !dto.getDosage().isEmpty()) {
                        existing.setDosage(dto.getDosage());
                    }
                    if (dto.getAdministrationRoute() != null && !dto.getAdministrationRoute().isEmpty()) {
                        existing.setAdministrationRoute(dto.getAdministrationRoute());
                    }
                    if (dto.getNotes() != null && !dto.getNotes().isEmpty()) {
                        existing.setNotes(dto.getNotes());
                    }
                    // Keep unit price stable, but allow override if provided
                    if (dto.getUnitPrice() != null) {
                        existing.setUnitPrice(dto.getUnitPrice());
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    PatientTreatment created = new PatientTreatment();
                    created.setVisitSession(vs);
                    created.setInventoryItem(item);
                    created.setItemName(item.getName());
                    created.setSku(item.getSku());
                    created.setQuantity(dto.getQuantity() == null ? 1 : dto.getQuantity());
                    created.setUnitPrice(dto.getUnitPrice() != null ? dto.getUnitPrice() : item.getUnitPrice());
                    created.setNotes(dto.getNotes());
                    created.setDosage(dto.getDosage());
                    created.setAdministrationRoute(dto.getAdministrationRoute());
                    return created;
                });

        PatientTreatment saved = patientTreatmentRepository.save(entity);
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR','ACCOUNTANT','ACCOUNT_STORE_MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientTreatmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private PatientTreatmentDto toDto(PatientTreatment pt) {
        PatientTreatmentDto dto = new PatientTreatmentDto();
        dto.setId(pt.getId());
        dto.setVisitSessionId(pt.getVisitSession().getId());
        dto.setInventoryItemId(pt.getInventoryItem().getId());
        dto.setItemName(pt.getItemName());
        dto.setSku(pt.getSku());
        dto.setQuantity(pt.getQuantity());
        dto.setUnitPrice(pt.getUnitPrice());
        dto.setNotes(pt.getNotes());
        dto.setDosage(pt.getDosage());
        dto.setAdministrationRoute(pt.getAdministrationRoute());
        return dto;
    }
}


