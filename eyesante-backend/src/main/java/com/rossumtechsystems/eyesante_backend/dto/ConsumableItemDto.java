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
public class ConsumableItemDto {
    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
