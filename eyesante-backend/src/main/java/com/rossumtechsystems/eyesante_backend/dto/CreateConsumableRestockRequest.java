package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateConsumableRestockRequest {
    private Long consumableItemId;
    private BigDecimal quantityAdded;
    private String supplierName;
    private BigDecimal costPerUnit;
    private BigDecimal totalCost;
    private String invoiceNumber;
    private LocalDate expiryDate;
    private String notes;
    private LocalDateTime restockDate;
}
