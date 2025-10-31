package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreateEyeExaminationRequest;
import com.rossumtechsystems.eyesante_backend.dto.EyeExaminationDto;
import com.rossumtechsystems.eyesante_backend.entity.EyeExamination;
import com.rossumtechsystems.eyesante_backend.entity.Patient;
import com.rossumtechsystems.eyesante_backend.repository.EyeExaminationRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EyeExaminationService {

    @Autowired
    private EyeExaminationRepository eyeExaminationRepository;

    @Autowired
    private PatientRepository patientRepository;

    public EyeExaminationDto createEyeExamination(CreateEyeExaminationRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        EyeExamination examination = new EyeExamination();
        examination.setPatient(patient);
        examination.setExaminationDate(LocalDateTime.now());
        examination.setExaminerId(request.getExaminerId());
        examination.setExaminerName(request.getExaminerName());
        examination.setChiefComplaint(request.getChiefComplaint());
        examination.setVisualAcuityRight(request.getVisualAcuityRight());
        examination.setVisualAcuityLeft(request.getVisualAcuityLeft());
        examination.setIntraocularPressureRight(request.getIntraocularPressureRight());
        examination.setIntraocularPressureLeft(request.getIntraocularPressureLeft());
        examination.setRefractionRight(request.getRefractionRight());
        examination.setRefractionLeft(request.getRefractionLeft());
        examination.setDiagnosis(request.getDiagnosis());
        examination.setTreatmentPlan(request.getTreatmentPlan());
        examination.setNextAppointment(request.getNextAppointment());
        examination.setEyeHistory(request.getEyeHistory());
        examination.setFamilyEyeHistory(request.getFamilyEyeHistory());
        examination.setNotes(request.getNotes());

        EyeExamination savedExamination = eyeExaminationRepository.save(examination);
        return toDto(savedExamination);
    }

    public Page<EyeExaminationDto> getPatientEyeExaminations(Long patientId, Pageable pageable) {
        Page<EyeExamination> examinations = eyeExaminationRepository.findByPatientIdOrderByExaminationDateDesc(patientId, pageable);
        return examinations.map(this::toDto);
    }

    public Page<EyeExaminationDto> getAllEyeExaminations(Pageable pageable) {
        Page<EyeExamination> examinations = eyeExaminationRepository.findAll(pageable);
        return examinations.map(this::toDto);
    }

    public Optional<EyeExaminationDto> getLatestEyeExamination(Long patientId) {
        List<EyeExamination> examinations = eyeExaminationRepository.findLatestExaminationByPatientId(patientId);
        if (examinations.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(toDto(examinations.get(0)));
    }

    public Page<EyeExaminationDto> getExaminationsByDiagnosis(String diagnosis, Pageable pageable) {
        Page<EyeExamination> examinations = eyeExaminationRepository.findByDiagnosisContainingIgnoreCase(diagnosis, pageable);
        return examinations.map(this::toDto);
    }

    private EyeExaminationDto toDto(EyeExamination examination) {
        EyeExaminationDto dto = new EyeExaminationDto();
        dto.setId(examination.getId());
        dto.setPatientId(examination.getPatient().getId());
        dto.setExaminationDate(examination.getExaminationDate());
        dto.setExaminerId(examination.getExaminerId());
        dto.setExaminerName(examination.getExaminerName());
        dto.setChiefComplaint(examination.getChiefComplaint());
        dto.setVisualAcuityRight(examination.getVisualAcuityRight());
        dto.setVisualAcuityLeft(examination.getVisualAcuityLeft());
        dto.setIntraocularPressureRight(examination.getIntraocularPressureRight());
        dto.setIntraocularPressureLeft(examination.getIntraocularPressureLeft());
        dto.setRefractionRight(examination.getRefractionRight());
        dto.setRefractionLeft(examination.getRefractionLeft());
        dto.setDiagnosis(examination.getDiagnosis());
        dto.setTreatmentPlan(examination.getTreatmentPlan());
        dto.setNextAppointment(examination.getNextAppointment());
        dto.setEyeHistory(examination.getEyeHistory());
        dto.setFamilyEyeHistory(examination.getFamilyEyeHistory());
        dto.setNotes(examination.getNotes());
        dto.setCreatedAt(examination.getCreatedAt());
        dto.setUpdatedAt(examination.getUpdatedAt());
        return dto;
    }
} 