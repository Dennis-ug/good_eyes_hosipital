package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreateSurgeryReportRequest;
import com.rossumtechsystems.eyesante_backend.dto.SurgeryReportDto;
import com.rossumtechsystems.eyesante_backend.dto.UpdateSurgeryReportRequest;
import com.rossumtechsystems.eyesante_backend.dto.SurgeryReportConsumableRequest;
import com.rossumtechsystems.eyesante_backend.entity.PatientProcedure;
import com.rossumtechsystems.eyesante_backend.entity.SurgeryReport;
import com.rossumtechsystems.eyesante_backend.entity.SurgeryReportConsumable;
import com.rossumtechsystems.eyesante_backend.entity.ConsumableItem;
import com.rossumtechsystems.eyesante_backend.repository.PatientProcedureRepository;
import com.rossumtechsystems.eyesante_backend.repository.SurgeryReportRepository;
import com.rossumtechsystems.eyesante_backend.repository.SurgeryReportConsumableRepository;
import com.rossumtechsystems.eyesante_backend.repository.ConsumableItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SurgeryReportService {

    @Autowired
    private SurgeryReportRepository surgeryReportRepository;

    @Autowired
    private PatientProcedureRepository patientProcedureRepository;

    @Autowired
    private SurgeryReportConsumableRepository surgeryReportConsumableRepository;

    @Autowired
    private ConsumableItemRepository consumableItemRepository;

    public SurgeryReportDto createReport(CreateSurgeryReportRequest request) {
        PatientProcedure procedure = patientProcedureRepository.findById(request.getPatientProcedureId())
                .orElseThrow(() -> new RuntimeException("Patient procedure not found"));

        SurgeryReport report = new SurgeryReport();
        report.setPatientProcedure(procedure);
        report.setAnesthesiaType(request.getAnesthesiaType());
        report.setDiagnosis(request.getDiagnosis());
        report.setSurgeryType(request.getSurgeryType());
        report.setEyeSide(request.getEyeSide());
        report.setSurgeonName(request.getSurgeonName());
        report.setAssistantName(request.getAssistantName());
        report.setComments(request.getComments());
        report.setStartTime(request.getStartTime());
        report.setEndTime(request.getEndTime());

        SurgeryReport saved = surgeryReportRepository.save(report);

        // Add consumable items if provided
        if (request.getConsumableItems() != null && !request.getConsumableItems().isEmpty()) {
            for (SurgeryReportConsumableRequest consumableRequest : request.getConsumableItems()) {
                ConsumableItem consumableItem = consumableItemRepository.findById(consumableRequest.getConsumableItemId())
                        .orElseThrow(() -> new RuntimeException("Consumable item not found with ID: " + consumableRequest.getConsumableItemId()));

                SurgeryReportConsumable surgeryReportConsumable = new SurgeryReportConsumable();
                surgeryReportConsumable.setSurgeryReport(saved);
                surgeryReportConsumable.setConsumableItem(consumableItem);
                surgeryReportConsumable.setQuantityUsed(consumableRequest.getQuantityUsed());
                surgeryReportConsumable.setNotes(consumableRequest.getNotes());

                surgeryReportConsumableRepository.save(surgeryReportConsumable);
            }
        }

        // Update procedure status to performed (done) when report is saved
        procedure.setPerformed(true);
        procedure.setPerformedDate(LocalDateTime.now());
        patientProcedureRepository.save(procedure);

        return SurgeryReportDto.fromEntity(saved);
    }

    public List<SurgeryReportDto> getReportsByProcedure(Long patientProcedureId) {
        return surgeryReportRepository.findByPatientProcedureId(patientProcedureId)
                .stream()
                .map(SurgeryReportDto::fromEntity)
                .collect(Collectors.toList());
    }

    public SurgeryReportDto updateReport(Long reportId, UpdateSurgeryReportRequest request) {
        SurgeryReport report = surgeryReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Surgery report not found"));

        // Update fields if provided
        if (request.getAnesthesiaType() != null) {
            report.setAnesthesiaType(request.getAnesthesiaType());
        }
        if (request.getDiagnosis() != null) {
            report.setDiagnosis(request.getDiagnosis());
        }
        if (request.getSurgeryType() != null) {
            report.setSurgeryType(request.getSurgeryType());
        }
        if (request.getEyeSide() != null) {
            report.setEyeSide(request.getEyeSide());
        }
        if (request.getSurgeonName() != null) {
            report.setSurgeonName(request.getSurgeonName());
        }
        if (request.getAssistantName() != null) {
            report.setAssistantName(request.getAssistantName());
        }
        if (request.getComments() != null) {
            report.setComments(request.getComments());
        }
        if (request.getStartTime() != null) {
            report.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            report.setEndTime(request.getEndTime());
        }

        SurgeryReport updated = surgeryReportRepository.save(report);

        // Update consumable items if provided
        if (request.getConsumableItems() != null) {
            // Clear existing consumable items
            surgeryReportConsumableRepository.deleteBySurgeryReportId(report.getId());

            // Add new consumable items
            for (SurgeryReportConsumableRequest consumableRequest : request.getConsumableItems()) {
                ConsumableItem consumableItem = consumableItemRepository.findById(consumableRequest.getConsumableItemId())
                        .orElseThrow(() -> new RuntimeException("Consumable item not found with ID: " + consumableRequest.getConsumableItemId()));

                SurgeryReportConsumable surgeryReportConsumable = new SurgeryReportConsumable();
                surgeryReportConsumable.setSurgeryReport(updated);
                surgeryReportConsumable.setConsumableItem(consumableItem);
                surgeryReportConsumable.setQuantityUsed(consumableRequest.getQuantityUsed());
                surgeryReportConsumable.setNotes(consumableRequest.getNotes());

                surgeryReportConsumableRepository.save(surgeryReportConsumable);
            }
        }

        // Update procedure status to performed (done) when report is updated
        PatientProcedure procedure = updated.getPatientProcedure();
        procedure.setPerformed(true);
        procedure.setPerformedDate(LocalDateTime.now());
        patientProcedureRepository.save(procedure);

        // Fetch the updated report with consumable items to ensure we return the complete data
        SurgeryReport finalReport = surgeryReportRepository.findById(updated.getId())
                .orElseThrow(() -> new RuntimeException("Surgery report not found after update"));

        return SurgeryReportDto.fromEntity(finalReport);
    }

    public SurgeryReportDto getReportById(Long reportId) {
        SurgeryReport report = surgeryReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Surgery report not found"));
        return SurgeryReportDto.fromEntity(report);
    }
}


