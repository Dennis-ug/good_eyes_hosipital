package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryReportConsumableRequest {
    private Long consumableItemId;
    private BigDecimal quantityUsed;
    private String notes;
}
