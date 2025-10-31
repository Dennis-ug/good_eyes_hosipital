package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PatientInvestigationDto {
    private Long id;
    private Long visitSessionId;
    private Long investigationTypeId;
    private String investigationName;
    private String eyeSide;
    private Integer quantity;
    private BigDecimal cost;
    private String notes;
}


