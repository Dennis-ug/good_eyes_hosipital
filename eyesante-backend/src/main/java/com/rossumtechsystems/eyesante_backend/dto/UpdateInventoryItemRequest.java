package com.rossumtechsystems.eyesante_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInventoryItemRequest {
    private String name;
    private String description;
    private String sku;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private Integer minimumStockLevel;
    private Integer maximumStockLevel;
    private String unitOfMeasure;
    private Long categoryId;
    private String supplierName;
    private String supplierContact;
    private Integer reorderPoint;
    private Integer reorderQuantity;

    // Optional medicine fields
    private String genericName;
    private String dosageForm;
    private String strength;
    private String activeIngredient;
    private LocalDate expiryDate;
    private String batchNumber;
    private Boolean requiresPrescription;
    private Boolean controlledSubstance;
    private String storageConditions;
}


