package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.BasicRefractionExamDto;
import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.BasicRefractionExam;
import com.rossumtechsystems.eyesante_backend.service.BasicRefractionExamService;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/basic-refraction-exams")
@RequiredArgsConstructor
@Slf4j
public class BasicRefractionExamController {

    private final BasicRefractionExamService basicRefractionExamService;
    private final PatientVisitSessionRepository patientVisitSessionRepository;

    /**
     * Create basic refraction exam
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BasicRefractionExamDto> createBasicRefractionExam(@RequestBody BasicRefractionExamDto basicRefractionExamDto) {
        log.info("Creating basic refraction exam for visit session ID: {}", basicRefractionExamDto.getVisitSessionId());
        
        // Convert DTO to entity
        BasicRefractionExam basicRefractionExam = convertDtoToEntity(basicRefractionExamDto);
        
        BasicRefractionExamDto created = basicRefractionExamService.createBasicRefractionExam(basicRefractionExam);
        return ResponseEntity.ok(created);
    }

    /**
     * Get basic refraction exam by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BasicRefractionExamDto> getBasicRefractionExamById(@PathVariable Long id) {
        log.info("Fetching basic refraction exam by ID: {}", id);
        Optional<BasicRefractionExamDto> exam = basicRefractionExamService.getBasicRefractionExamById(id);
        return exam.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get basic refraction exam by visit session ID
     */
    @GetMapping("/visit-session/{visitSessionId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BasicRefractionExamDto> getBasicRefractionExamByVisitSessionId(@PathVariable Long visitSessionId) {
        log.info("Fetching basic refraction exam for visit session ID: {}", visitSessionId);
        Optional<BasicRefractionExamDto> exam = basicRefractionExamService.getBasicRefractionExamByVisitSessionId(visitSessionId);
        return exam.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all basic refraction exams
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<BasicRefractionExamDto>> getAllBasicRefractionExams() {
        log.info("Fetching all basic refraction exams");
        List<BasicRefractionExamDto> exams = basicRefractionExamService.getAllBasicRefractionExams();
        return ResponseEntity.ok(exams);
    }

    /**
     * Update basic refraction exam
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BasicRefractionExamDto> updateBasicRefractionExam(@PathVariable Long id, @RequestBody BasicRefractionExamDto basicRefractionExamDto) {
        log.info("Updating basic refraction exam ID: {}", id);
        
        // Convert DTO to entity
        BasicRefractionExam basicRefractionExam = convertDtoToEntity(basicRefractionExamDto);
        
        BasicRefractionExamDto updated = basicRefractionExamService.updateBasicRefractionExam(id, basicRefractionExam);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete basic refraction exam
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> deleteBasicRefractionExam(@PathVariable Long id) {
        log.info("Deleting basic refraction exam ID: {}", id);
        basicRefractionExamService.deleteBasicRefractionExam(id);
        var body = new java.util.HashMap<String, Object>();
        body.put("status", "success");
        body.put("message", "Basic refraction exam deleted");
        body.put("id", id);
        return ResponseEntity.ok(body);
    }
    
    /**
     * Convert DTO to entity with proper relationship mapping
     */
    private BasicRefractionExam convertDtoToEntity(BasicRefractionExamDto dto) {
        BasicRefractionExam entity = new BasicRefractionExam();
        
        // Set visit session relationship
        if (dto.getVisitSessionId() != null) {
            var visitSession = patientVisitSessionRepository.findById(dto.getVisitSessionId())
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + dto.getVisitSessionId()));
            entity.setVisitSession(visitSession);
        }
        
        // Set other fields
        entity.setNeuroOriented(dto.getNeuroOriented());
        entity.setNeuroMood(dto.getNeuroMood());
        entity.setPupilsPerrl(dto.getPupilsPerrl());
        entity.setPupilsRightDark(dto.getPupilsRightDark());
        entity.setPupilsRightLight(dto.getPupilsRightLight());
        entity.setPupilsRightShape(dto.getPupilsRightShape());
        entity.setPupilsRightReact(dto.getPupilsRightReact());
        entity.setPupilsRightApd(dto.getPupilsRightApd());
        entity.setPupilsLeftDark(dto.getPupilsLeftDark());
        entity.setPupilsLeftLight(dto.getPupilsLeftLight());
        entity.setPupilsLeftShape(dto.getPupilsLeftShape());
        entity.setPupilsLeftReact(dto.getPupilsLeftReact());
        entity.setPupilsLeftApd(dto.getPupilsLeftApd());
        entity.setVisualAcuityDistanceScRight(dto.getVisualAcuityDistanceScRight());
        entity.setVisualAcuityDistanceScLeft(dto.getVisualAcuityDistanceScLeft());
        entity.setVisualAcuityDistancePhRight(dto.getVisualAcuityDistancePhRight());
        entity.setVisualAcuityDistancePhLeft(dto.getVisualAcuityDistancePhLeft());
        entity.setVisualAcuityDistanceCcRight(dto.getVisualAcuityDistanceCcRight());
        entity.setVisualAcuityDistanceCcLeft(dto.getVisualAcuityDistanceCcLeft());
        entity.setVisualAcuityNearScRight(dto.getVisualAcuityNearScRight());
        entity.setVisualAcuityNearScLeft(dto.getVisualAcuityNearScLeft());
        entity.setVisualAcuityNearCcRight(dto.getVisualAcuityNearCcRight());
        entity.setVisualAcuityNearCcLeft(dto.getVisualAcuityNearCcLeft());
        entity.setKeratometryK1Right(dto.getKeratometryK1Right());
        entity.setKeratometryK2Right(dto.getKeratometryK2Right());
        entity.setKeratometryAxisRight(dto.getKeratometryAxisRight());
        entity.setKeratometryK1Left(dto.getKeratometryK1Left());
        entity.setKeratometryK2Left(dto.getKeratometryK2Left());
        entity.setKeratometryAxisLeft(dto.getKeratometryAxisLeft());
        entity.setManifestAutoRightSphere(dto.getManifestAutoRightSphere());
        entity.setManifestAutoRightCylinder(dto.getManifestAutoRightCylinder());
        entity.setManifestAutoRightAxis(dto.getManifestAutoRightAxis());
        entity.setManifestAutoLeftSphere(dto.getManifestAutoLeftSphere());
        entity.setManifestAutoLeftCylinder(dto.getManifestAutoLeftCylinder());
        entity.setManifestAutoLeftAxis(dto.getManifestAutoLeftAxis());
        entity.setManifestRetRightSphere(dto.getManifestRetRightSphere());
        entity.setManifestRetRightCylinder(dto.getManifestRetRightCylinder());
        entity.setManifestRetRightAxis(dto.getManifestRetRightAxis());
        entity.setManifestRetLeftSphere(dto.getManifestRetLeftSphere());
        entity.setManifestRetLeftCylinder(dto.getManifestRetLeftCylinder());
        entity.setManifestRetLeftAxis(dto.getManifestRetLeftAxis());
        entity.setSubjectiveRightSphere(dto.getSubjectiveRightSphere());
        entity.setSubjectiveRightCylinder(dto.getSubjectiveRightCylinder());
        entity.setSubjectiveRightAxis(dto.getSubjectiveRightAxis());
        entity.setSubjectiveLeftSphere(dto.getSubjectiveLeftSphere());
        entity.setSubjectiveLeftCylinder(dto.getSubjectiveLeftCylinder());
        entity.setSubjectiveLeftAxis(dto.getSubjectiveLeftAxis());
        entity.setAddedValues(dto.getAddedValues());
        entity.setBestRightVision(dto.getBestRightVision());
        entity.setBestLeftVision(dto.getBestLeftVision());
        entity.setPdRightEye(dto.getPdRightEye());
        entity.setPdLeftEye(dto.getPdLeftEye());
        entity.setComment(dto.getComment());
        
        return entity;
    }
}
