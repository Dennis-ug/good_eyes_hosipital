package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.rossumtechsystems.eyesante_backend.entity.SurgeryReport;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateSurgeryReportRequest {
    private Long patientProcedureId;
    private SurgeryReport.AnesthesiaType anesthesiaType; // LOCAL or GENERAL
    private String diagnosis; // DX text
    private SurgeryReport.SurgeryType surgeryType; // ELECTIVE or EMERGENCY
    private SurgeryReport.EyeSide eyeSide; // LEFT, RIGHT, BOTH
    private String surgeonName;
    private String assistantName;
    private String comments;

    @JsonDeserialize(using = DateTimeDeserializer.class)
    private LocalDateTime startTime;

    @JsonDeserialize(using = DateTimeDeserializer.class)
    private LocalDateTime endTime;

    private List<SurgeryReportConsumableRequest> consumableItems;
}


