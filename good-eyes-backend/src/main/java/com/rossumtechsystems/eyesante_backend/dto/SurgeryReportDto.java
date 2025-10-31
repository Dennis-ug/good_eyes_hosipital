package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rossumtechsystems.eyesante_backend.entity.SurgeryReport;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class SurgeryReportDto {
    private Long id;
    private Long patientProcedureId;
    private SurgeryReport.AnesthesiaType anesthesiaType;
    private String diagnosis;
    private SurgeryReport.SurgeryType surgeryType;
    private SurgeryReport.EyeSide eyeSide;
    private String surgeonName;
    private String assistantName;
    private String comments;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    private List<SurgeryReportConsumableDto> consumableItems;

    public static SurgeryReportDto fromEntity(SurgeryReport entity) {
        SurgeryReportDto dto = new SurgeryReportDto();
        dto.setId(entity.getId());
        dto.setPatientProcedureId(entity.getPatientProcedure().getId());
        dto.setAnesthesiaType(entity.getAnesthesiaType());
        dto.setDiagnosis(entity.getDiagnosis());
        dto.setSurgeryType(entity.getSurgeryType());
        dto.setEyeSide(entity.getEyeSide());
        dto.setSurgeonName(entity.getSurgeonName());
        dto.setAssistantName(entity.getAssistantName());
        dto.setComments(entity.getComments());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setCreatedAt(entity.getCreatedAt());
        
        // Convert consumable items
        if (entity.getConsumableItems() != null) {
            dto.setConsumableItems(entity.getConsumableItems().stream()
                .map(SurgeryReportConsumableDto::fromEntity)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
}


