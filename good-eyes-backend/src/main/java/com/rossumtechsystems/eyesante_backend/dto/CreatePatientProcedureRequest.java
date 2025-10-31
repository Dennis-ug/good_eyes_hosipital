package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePatientProcedureRequest {
    private Long visitSessionId;
    private Long procedureId;
    private String eyeSide;
    private BigDecimal cost;
    private Boolean performed;
    private String performedBy;
    private BigDecimal staffFee;
    private String notes;
}
