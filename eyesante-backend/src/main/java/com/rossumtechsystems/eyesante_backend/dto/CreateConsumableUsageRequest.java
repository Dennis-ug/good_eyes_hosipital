package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateConsumableUsageRequest {
    private Long consumableItemId;
    private BigDecimal quantityUsed;
    private Long departmentId;
    private String purpose;
    private Long patientId;
    private Long visitSessionId;
    private String notes;
    private LocalDateTime usageDate;
}
