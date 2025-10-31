package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PatientDiagnosisDto {
    private Long id;
    private Long visitSessionId;
    private DiagnosisDto diagnosis;
    private LocalDateTime diagnosisDate;
    private String severity;
    private String notes;
    private Boolean isPrimaryDiagnosis;
    private Boolean isConfirmed;
    private String diagnosedBy;
    private String eyeSide;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
