package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.rossumtechsystems.eyesante_backend.entity.SurgeryReport;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSurgeryReportRequest {
    private SurgeryReport.AnesthesiaType anesthesiaType;
    private String diagnosis;
    private SurgeryReport.SurgeryType surgeryType;
    private SurgeryReport.EyeSide eyeSide;
    private String surgeonName;
    private String assistantName;
    private String comments;
    @JsonDeserialize(using = DateTimeDeserializer.class)
    private LocalDateTime startTime;
    
    @JsonDeserialize(using = DateTimeDeserializer.class)
    private LocalDateTime endTime;
    private List<SurgeryReportConsumableRequest> consumableItems;
}
