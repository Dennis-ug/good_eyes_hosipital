package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDto {
    private Long id;
    private String name;
    private String description;
    private String sku;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private Integer quantityInStock;
    private Integer minimumStockLevel;
    private Integer maximumStockLevel;
    private String unitOfMeasure;
    private Boolean isActive;
    
    // Category information
    private Long categoryId;
    private String categoryName;
    
    // Supplier information
    private String supplierName;
    private String supplierContact;
    
    // Reorder information
    private Integer reorderPoint;
    private Integer reorderQuantity;
    
    // Stock status
    private String stockStatus; // "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"

    // Optional medicine-specific fields
    private String genericName;
    private String dosageForm;
    private String strength;
    private String activeIngredient;
    private LocalDate expiryDate;
    private String batchNumber;
    private Boolean requiresPrescription;
    private Boolean controlledSubstance;
    private String storageConditions;

    // Optics/frame fields
    private String opticsType;
    private String frameShape;
    private String frameSize;
    private String frameMaterial;
    private String brand;
    private String model;
    private String color;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String updatedBy;
} 