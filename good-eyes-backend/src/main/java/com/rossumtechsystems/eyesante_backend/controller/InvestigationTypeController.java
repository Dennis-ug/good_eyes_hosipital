package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.entity.InvestigationType;
import com.rossumtechsystems.eyesante_backend.repository.InvestigationTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investigation-types")
@CrossOrigin(origins = "*")
public class InvestigationTypeController {

    @Autowired
    private InvestigationTypeRepository investigationTypeRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR','OPHTHALMOLOGIST','OPTOMETRIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<InvestigationType>> getAll() {
        return ResponseEntity.ok(investigationTypeRepository.findAllActive());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR','OPHTHALMOLOGIST','OPTOMETRIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<InvestigationType> getById(@PathVariable Long id) {
        return investigationTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<InvestigationType> create(@RequestBody InvestigationType payload) {
        payload.setId(null);
        InvestigationType saved = investigationTypeRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<InvestigationType> update(@PathVariable Long id, @RequestBody InvestigationType payload) {
        return investigationTypeRepository.findById(id)
                .map(existing -> {
                    existing.setName(payload.getName());
                    existing.setNormalRange(payload.getNormalRange());
                    existing.setUnit(payload.getUnit());
                    existing.setDescription(payload.getDescription());
                    InvestigationType saved = investigationTypeRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return investigationTypeRepository.findById(id)
                .map(existing -> {
                    existing.setIsActive(false);
                    investigationTypeRepository.save(existing);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}


