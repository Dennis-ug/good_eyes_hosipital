package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePatientInvestigationRequest {
    private Long visitSessionId;
    private Long investigationTypeId;
    private String eyeSide; // LEFT | RIGHT | BOTH
    private Integer quantity;
    private BigDecimal cost;
    private String notes;
}


