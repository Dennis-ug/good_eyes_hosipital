package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.BasicRefractionExamDto;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession.VisitStage;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession.VisitStatus;
import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.BasicRefractionExam;
import com.rossumtechsystems.eyesante_backend.repository.BasicRefractionExamRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import com.rossumtechsystems.eyesante_backend.exception.ResourceConflictException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BasicRefractionExamService {

    private final BasicRefractionExamRepository basicRefractionExamRepository;
    private final PatientVisitSessionRepository patientVisitSessionRepository;
    // Removed unused dependency
    // No additional dependencies required

    /**
     * Create basic refraction exam
     */
    public BasicRefractionExamDto createBasicRefractionExam(BasicRefractionExam basicRefractionExam) {
        log.info("Creating basic refraction exam for visit session ID: {}", basicRefractionExam.getVisitSession().getId());

        // Enforce one basic refraction exam per visit session
        if (basicRefractionExam.getVisitSession() != null && basicRefractionExam.getVisitSession().getId() != null) {
            Long visitSessionId = basicRefractionExam.getVisitSession().getId();
            basicRefractionExamRepository.findByVisitSessionId(visitSessionId)
                .ifPresent(existing -> { throw new ResourceConflictException(
                    "Basic refraction exam already exists for visit session " + visitSessionId);
                });
        }

        BasicRefractionExam saved = basicRefractionExamRepository.save(basicRefractionExam);
        Optional<PatientVisitSession> patientVisitSession = patientVisitSessionRepository.findById(basicRefractionExam.getVisitSession().getId());
        if (patientVisitSession.isPresent()) {
            patientVisitSession.get().setStatus(VisitStatus.BASIC_REFRACTION_COMPLETED);
            patientVisitSession.get().setCurrentStage(VisitStage.DOCTOR_VISIT);
            patientVisitSessionRepository.save(patientVisitSession.get());
        }
        return new BasicRefractionExamDto(saved);
    }

    /**
     * Get basic refraction exam by ID
     */
    @Transactional(readOnly = true)
    public Optional<BasicRefractionExamDto> getBasicRefractionExamById(Long id) {
        log.info("Fetching basic refraction exam by ID: {}", id);
        return basicRefractionExamRepository.findByIdWithPatient(id)
                .map(BasicRefractionExamDto::new);
    }

    /**
     * Get basic refraction exam by visit session ID
     */
    @Transactional(readOnly = true)
    public Optional<BasicRefractionExamDto> getBasicRefractionExamByVisitSessionId(Long visitSessionId) {
        log.info("Fetching basic refraction exam for visit session ID: {}", visitSessionId);
        return basicRefractionExamRepository.findByVisitSessionIdWithPatient(visitSessionId)
                .map(BasicRefractionExamDto::new);
    }

    /**
     * Get all basic refraction exams
     */
    @Transactional(readOnly = true)
    public List<BasicRefractionExamDto> getAllBasicRefractionExams() {
        log.info("Fetching all basic refraction exams");
        return basicRefractionExamRepository.findAllWithPatientDetails().stream()
                .map(BasicRefractionExamDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Update basic refraction exam
     */
    public BasicRefractionExamDto updateBasicRefractionExam(Long id, BasicRefractionExam basicRefractionExam) {
        log.info("Updating basic refraction exam ID: {}", id);
        
        BasicRefractionExam existing = basicRefractionExamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Basic refraction exam not found with ID: " + id));
        
        // Update fields
        existing.setNeuroOriented(basicRefractionExam.getNeuroOriented());
        existing.setNeuroMood(basicRefractionExam.getNeuroMood());
        existing.setPupilsPerrl(basicRefractionExam.getPupilsPerrl());
        existing.setPupilsRightDark(basicRefractionExam.getPupilsRightDark());
        existing.setPupilsRightLight(basicRefractionExam.getPupilsRightLight());
        existing.setPupilsRightShape(basicRefractionExam.getPupilsRightShape());
        existing.setPupilsRightReact(basicRefractionExam.getPupilsRightReact());
        existing.setPupilsRightApd(basicRefractionExam.getPupilsRightApd());
        existing.setPupilsLeftDark(basicRefractionExam.getPupilsLeftDark());
        existing.setPupilsLeftLight(basicRefractionExam.getPupilsLeftLight());
        existing.setPupilsLeftShape(basicRefractionExam.getPupilsLeftShape());
        existing.setPupilsLeftReact(basicRefractionExam.getPupilsLeftReact());
        existing.setPupilsLeftApd(basicRefractionExam.getPupilsLeftApd());
        existing.setVisualAcuityDistanceScRight(basicRefractionExam.getVisualAcuityDistanceScRight());
        existing.setVisualAcuityDistanceScLeft(basicRefractionExam.getVisualAcuityDistanceScLeft());
        existing.setVisualAcuityDistancePhRight(basicRefractionExam.getVisualAcuityDistancePhRight());
        existing.setVisualAcuityDistancePhLeft(basicRefractionExam.getVisualAcuityDistancePhLeft());
        existing.setVisualAcuityDistanceCcRight(basicRefractionExam.getVisualAcuityDistanceCcRight());
        existing.setVisualAcuityDistanceCcLeft(basicRefractionExam.getVisualAcuityDistanceCcLeft());
        existing.setVisualAcuityNearScRight(basicRefractionExam.getVisualAcuityNearScRight());
        existing.setVisualAcuityNearScLeft(basicRefractionExam.getVisualAcuityNearScLeft());
        existing.setVisualAcuityNearCcRight(basicRefractionExam.getVisualAcuityNearCcRight());
        existing.setVisualAcuityNearCcLeft(basicRefractionExam.getVisualAcuityNearCcLeft());
        existing.setKeratometryK1Right(basicRefractionExam.getKeratometryK1Right());
        existing.setKeratometryK2Right(basicRefractionExam.getKeratometryK2Right());
        existing.setKeratometryAxisRight(basicRefractionExam.getKeratometryAxisRight());
        existing.setKeratometryK1Left(basicRefractionExam.getKeratometryK1Left());
        existing.setKeratometryK2Left(basicRefractionExam.getKeratometryK2Left());
        existing.setKeratometryAxisLeft(basicRefractionExam.getKeratometryAxisLeft());
        existing.setManifestAutoRightSphere(basicRefractionExam.getManifestAutoRightSphere());
        existing.setManifestAutoRightCylinder(basicRefractionExam.getManifestAutoRightCylinder());
        existing.setManifestAutoRightAxis(basicRefractionExam.getManifestAutoRightAxis());
        existing.setManifestAutoLeftSphere(basicRefractionExam.getManifestAutoLeftSphere());
        existing.setManifestAutoLeftCylinder(basicRefractionExam.getManifestAutoLeftCylinder());
        existing.setManifestAutoLeftAxis(basicRefractionExam.getManifestAutoLeftAxis());
        existing.setManifestRetRightSphere(basicRefractionExam.getManifestRetRightSphere());
        existing.setManifestRetRightCylinder(basicRefractionExam.getManifestRetRightCylinder());
        existing.setManifestRetRightAxis(basicRefractionExam.getManifestRetRightAxis());
        existing.setManifestRetLeftSphere(basicRefractionExam.getManifestRetLeftSphere());
        existing.setManifestRetLeftCylinder(basicRefractionExam.getManifestRetLeftCylinder());
        existing.setManifestRetLeftAxis(basicRefractionExam.getManifestRetLeftAxis());
        existing.setSubjectiveRightSphere(basicRefractionExam.getSubjectiveRightSphere());
        existing.setSubjectiveRightCylinder(basicRefractionExam.getSubjectiveRightCylinder());
        existing.setSubjectiveRightAxis(basicRefractionExam.getSubjectiveRightAxis());
        existing.setSubjectiveLeftSphere(basicRefractionExam.getSubjectiveLeftSphere());
        existing.setSubjectiveLeftCylinder(basicRefractionExam.getSubjectiveLeftCylinder());
        existing.setSubjectiveLeftAxis(basicRefractionExam.getSubjectiveLeftAxis());
        existing.setAddedValues(basicRefractionExam.getAddedValues());
        existing.setBestRightVision(basicRefractionExam.getBestRightVision());
        existing.setBestLeftVision(basicRefractionExam.getBestLeftVision());
        existing.setPdRightEye(basicRefractionExam.getPdRightEye());
        existing.setPdLeftEye(basicRefractionExam.getPdLeftEye());
        existing.setComment(basicRefractionExam.getComment());
        // examinedBy not part of UI model
        
        BasicRefractionExam saved = basicRefractionExamRepository.save(existing);
        return new BasicRefractionExamDto(saved);
    }

    /**
     * Delete basic refraction exam
     */
    public void deleteBasicRefractionExam(Long id) {
        log.info("Deleting basic refraction exam ID: {}", id);
        
        if (!basicRefractionExamRepository.existsById(id)) {
            throw new RuntimeException("Basic refraction exam not found with ID: " + id);
        }
        
        basicRefractionExamRepository.deleteById(id);
    }
}
