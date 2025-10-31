package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateConsumableItemRequest {
    private String name;
    private String description;
    private Long categoryId;
    private String sku;
    private String unitOfMeasure;
    private BigDecimal currentStock;
    private BigDecimal minimumStockLevel;
    private BigDecimal maximumStockLevel;
    private BigDecimal reorderPoint;
    private BigDecimal reorderQuantity;
    private String supplierName;
    private String supplierContact;
    private BigDecimal costPerUnit;
    private String location;
    private String store;
    private LocalDate expiryDate;
    private Boolean isActive;
}
