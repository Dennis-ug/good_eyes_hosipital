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
public class ConsumableRestockDto {
    private Long id;
    private Long consumableItemId;
    private String consumableItemName;
    private BigDecimal quantityAdded;
    private LocalDateTime restockDate;
    private Long restockedByUserId;
    private String restockedByUserName;
    private String supplierName;
    private BigDecimal costPerUnit;
    private BigDecimal totalCost;
    private String invoiceNumber;
    private LocalDate expiryDate;
    private String notes;
    private LocalDateTime createdAt;
}
