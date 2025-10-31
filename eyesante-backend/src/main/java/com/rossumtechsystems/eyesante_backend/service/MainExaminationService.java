package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.MainExaminationDto;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession.VisitStage;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession.VisitStatus;
import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.MainExamination;
import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.SlitLampObservation;
import com.rossumtechsystems.eyesante_backend.repository.MainExaminationRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Slf4j
public class MainExaminationService {

    private final MainExaminationRepository mainExaminationRepository;
    private final PatientVisitSessionRepository patientVisitSessionRepository;

    @Transactional
    public MainExaminationDto create(MainExaminationDto dto) {
        log.info("Creating main examination for visit session {}", dto.getVisitSessionId());
        MainExamination entity = fromDto(dto);
        Optional<PatientVisitSession> patientVisitSession = patientVisitSessionRepository.findById(entity.getVisitSession().getId());
        if (patientVisitSession.isPresent()) {
            patientVisitSession.get().setStatus(VisitStatus.DOCTOR_VISIT_COMPLETED);
            patientVisitSession.get().setCurrentStage(VisitStage.PHARMACY);
            patientVisitSessionRepository.save(patientVisitSession.get());
        }
        return new MainExaminationDto(mainExaminationRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public Optional<MainExaminationDto> getById(Long id) {
        return mainExaminationRepository.findByIdWithObservations(id).map(MainExaminationDto::new);
    }

    @Transactional(readOnly = true)
    public Optional<MainExaminationDto> getByVisitSessionId(Long visitSessionId) {
        return mainExaminationRepository.findByVisitSessionIdWithObservations(visitSessionId).map(MainExaminationDto::new);
    }

    @Transactional(readOnly = true)
    public Page<MainExaminationDto> getAll(Pageable pageable) {
        return mainExaminationRepository.findAll(pageable).map(MainExaminationDto::new);
    }

    @Transactional
    public MainExaminationDto update(Long id, MainExaminationDto dto) {
        MainExamination existing = mainExaminationRepository.findByIdWithObservations(id)
                .orElseThrow(() -> new RuntimeException("Main examination not found: " + id));

        existing.setExternalRight(dto.getExternalRight());
        existing.setExternalLeft(dto.getExternalLeft());
        existing.setCdrRight(dto.getCdrRight());
        existing.setCdrLeft(dto.getCdrLeft());
        existing.setIopRight(dto.getIopRight());
        existing.setIopLeft(dto.getIopLeft());
        existing.setAdvice(dto.getAdvice());
        existing.setHistoryComments(dto.getHistoryComments());
        existing.setDoctorsNotes(dto.getDoctorsNotes());
        existing.setTimeCompleted(dto.getTimeCompleted());

        // Handle slit lamp observations more carefully
        if (dto.getSlitLampObservations() != null) {
            // Clear existing observations
            existing.getSlitLampObservations().clear();
            
            // Add new observations
            for (var o : dto.getSlitLampObservations()) {
                SlitLampObservation obs = new SlitLampObservation();

                obs.setStructure(o.getStructure());
                obs.setFinding(o.getFinding());
                obs.setEyeSide(o.getEyeSide());
                existing.getSlitLampObservations().add(obs);
            }
        } else {
            // If no observations provided, clear existing ones
            existing.getSlitLampObservations().clear();
        }

        return new MainExaminationDto(mainExaminationRepository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        mainExaminationRepository.deleteById(id);
    }

    private MainExamination fromDto(MainExaminationDto dto) {
        // Enforce one main exam per visit session
        mainExaminationRepository.findByVisitSessionIdWithObservations(dto.getVisitSessionId())
                .ifPresent(me -> { throw new com.rossumtechsystems.eyesante_backend.exception.ResourceConflictException(
                        "Main examination already exists for visit session " + dto.getVisitSessionId()); });

        MainExamination entity = new MainExamination();
        PatientVisitSession vs = patientVisitSessionRepository.findById(dto.getVisitSessionId())
                .orElseThrow(() -> new RuntimeException("Visit session not found: " + dto.getVisitSessionId()));
        entity.setVisitSession(vs);
        entity.setExternalRight(dto.getExternalRight());
        entity.setExternalLeft(dto.getExternalLeft());
        entity.setCdrRight(dto.getCdrRight());
        entity.setCdrLeft(dto.getCdrLeft());
        entity.setIopRight(dto.getIopRight());
        entity.setIopLeft(dto.getIopLeft());
        entity.setAdvice(dto.getAdvice());
        entity.setHistoryComments(dto.getHistoryComments());
        entity.setDoctorsNotes(dto.getDoctorsNotes());
        entity.setTimeCompleted(dto.getTimeCompleted());

        if (dto.getSlitLampObservations() != null) {
            for (var o : dto.getSlitLampObservations()) {
                SlitLampObservation obs = new SlitLampObservation();
                obs.setStructure(o.getStructure());
                obs.setFinding(o.getFinding());
                obs.setEyeSide(o.getEyeSide());
                if (entity.getSlitLampObservations() == null) {
                    entity.setSlitLampObservations(new java.util.ArrayList<>());
                }
                entity.getSlitLampObservations().add(obs);
            }
        }
        return entity;
    }
}

