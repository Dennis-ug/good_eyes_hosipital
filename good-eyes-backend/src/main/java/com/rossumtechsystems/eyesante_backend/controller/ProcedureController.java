package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.ProcedureDto;
import com.rossumtechsystems.eyesante_backend.service.ProcedureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/procedures")
@CrossOrigin(origins = "*")
public class ProcedureController {

    @Autowired
    private ProcedureService procedureService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<ProcedureDto>> getAllActiveProcedures() {
        List<ProcedureDto> procedures = procedureService.getAllActiveProcedures();
        return ResponseEntity.ok(procedures);
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = procedureService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<ProcedureDto>> getProceduresByCategory(@PathVariable String category) {
        List<ProcedureDto> procedures = procedureService.getProceduresByCategory(category);
        return ResponseEntity.ok(procedures);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ProcedureDto> getProcedureById(@PathVariable Long id) {
        Optional<ProcedureDto> procedure = procedureService.getProcedureById(id);
        return procedure.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ProcedureDto> createProcedure(@RequestBody ProcedureDto procedureDto) {
        ProcedureDto createdProcedure = procedureService.createProcedure(procedureDto);
        return ResponseEntity.ok(createdProcedure);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ProcedureDto> updateProcedure(@PathVariable Long id, @RequestBody ProcedureDto procedureDto) {
        ProcedureDto updatedProcedure = procedureService.updateProcedure(id, procedureDto);
        return ResponseEntity.ok(updatedProcedure);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteProcedure(@PathVariable Long id) {
        procedureService.deleteProcedure(id);
        return ResponseEntity.noContent().build();
    }
}
