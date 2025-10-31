package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.MainExaminationDto;
import com.rossumtechsystems.eyesante_backend.service.MainExaminationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/main-exams")
@RequiredArgsConstructor
@Slf4j
public class MainExaminationController {

    private final MainExaminationService mainExaminationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR','OPHTHALMOLOGIST','OPTOMETRIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<MainExaminationDto> create(@RequestBody MainExaminationDto dto) {
        return ResponseEntity.ok(mainExaminationService.create(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','OPHTHALMOLOGIST','OPTOMETRIST','RECEPTIONIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<MainExaminationDto> getById(@PathVariable Long id) {
        Optional<MainExaminationDto> res = mainExaminationService.getById(id);
        return res.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/visit-session/{visitSessionId}")
    @PreAuthorize("hasAnyRole('DOCTOR','OPHTHALMOLOGIST','OPTOMETRIST','RECEPTIONIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<MainExaminationDto> getByVisitSession(@PathVariable Long visitSessionId) {
        Optional<MainExaminationDto> res = mainExaminationService.getByVisitSessionId(visitSessionId);
        return res.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','OPHTHALMOLOGIST','OPTOMETRIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<MainExaminationDto> update(@PathVariable Long id, @RequestBody MainExaminationDto dto) {
        return ResponseEntity.ok(mainExaminationService.update(id, dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR','OPHTHALMOLOGIST','OPTOMETRIST','RECEPTIONIST','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Page<MainExaminationDto>> list(Pageable pageable) {
        return ResponseEntity.ok(mainExaminationService.getAll(pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> delete(@PathVariable Long id) {
        mainExaminationService.delete(id);
        var body = new java.util.HashMap<String, Object>();
        body.put("status", "success");
        body.put("message", "Main examination deleted");
        body.put("id", id);
        return ResponseEntity.ok(body);
    }
}

