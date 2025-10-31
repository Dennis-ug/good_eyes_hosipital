package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsumableUsageDto {
    private Long id;
    private Long consumableItemId;
    private String consumableItemName;
    private BigDecimal quantityUsed;
    private Long usedByUserId;
    private String usedByUserName;
    private Long departmentId;
    private String departmentName;
    private LocalDateTime usageDate;
    private String purpose;
    private Long patientId;
    private String patientName;
    private Long visitSessionId;
    private String notes;
    private LocalDateTime createdAt;
}
