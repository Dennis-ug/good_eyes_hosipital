package com.rossumtechsystems.eyesante_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePatientDiagnosisRequest {
    @NotNull(message = "Visit session ID is required")
    private Long visitSessionId;
    
    @NotNull(message = "Diagnosis ID is required")
    private Long diagnosisId;
    
    private String severity;
    private String notes;
    private Boolean isPrimaryDiagnosis = false;
    private Boolean isConfirmed = false;
    private String diagnosedBy;
    private String eyeSide; // LEFT | RIGHT | BOTH
}
