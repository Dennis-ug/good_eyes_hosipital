package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PatientProcedureDto {
    private Long id;
    private Long visitSessionId;
    private Long procedureId;
    private String procedureName;
    private String procedureCategory;
    private BigDecimal procedurePrice;
    private String eyeSide;
    private BigDecimal cost;
    private Boolean performed;
    private String performedBy;
    private LocalDateTime performedDate;
    private BigDecimal staffFee;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Patient information fields
    private String patientName;
    private String patientPhone;
}
