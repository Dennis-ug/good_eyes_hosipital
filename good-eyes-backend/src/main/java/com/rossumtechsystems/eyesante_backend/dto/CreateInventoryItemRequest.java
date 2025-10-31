package com.rossumtechsystems.eyesante_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInventoryItemRequest {
    
    @NotBlank(message = "Item name is required")
    @Size(max = 255, message = "Item name must not exceed 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;
    
    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;
    
    @Positive(message = "Cost price must be positive")
    private BigDecimal costPrice;
    
    @NotNull(message = "Quantity in stock is required")
    @jakarta.validation.constraints.Min(value = 0, message = "Quantity in stock must be 0 or greater")
    private Integer quantityInStock = 0;
    
    @jakarta.validation.constraints.Min(value = 0, message = "Minimum stock level must be 0 or greater")
    private Integer minimumStockLevel = 0;
    
    @jakarta.validation.constraints.Min(value = 1, message = "Maximum stock level must be greater than 0")
    private Integer maximumStockLevel;
    
    @Size(max = 50, message = "Unit of measure must not exceed 50 characters")
    private String unitOfMeasure;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    @Size(max = 255, message = "Supplier name must not exceed 255 characters")
    private String supplierName;
    
    @Size(max = 255, message = "Supplier contact must not exceed 255 characters")
    private String supplierContact;
    
    @jakarta.validation.constraints.Min(value = 0, message = "Reorder point must be 0 or greater")
    private Integer reorderPoint;
    
    @jakarta.validation.constraints.Min(value = 1, message = "Reorder quantity must be greater than 0")
    private Integer reorderQuantity;

    // Optional medicine-specific fields (kept optional to support non-drug items like lenses/frames)
    @Size(max = 200, message = "Generic name must not exceed 200 characters")
    private String genericName;

    @Size(max = 50, message = "Dosage form must not exceed 50 characters")
    private String dosageForm;

    @Size(max = 50, message = "Strength must not exceed 50 characters")
    private String strength;

    @Size(max = 200, message = "Active ingredient must not exceed 200 characters")
    private String activeIngredient;

    private LocalDate expiryDate;

    @Size(max = 100, message = "Batch number must not exceed 100 characters")
    private String batchNumber;

    private Boolean requiresPrescription;

    private Boolean controlledSubstance;

    @Size(max = 255, message = "Storage conditions must not exceed 255 characters")
    private String storageConditions;
}
