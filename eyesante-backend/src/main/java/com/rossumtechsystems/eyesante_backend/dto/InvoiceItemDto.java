package com.rossumtechsystems.eyesante_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemDto {
    private Long id;
    private Long invoiceId;
    private String itemName;
    private String itemDescription;
    private String itemType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private Boolean insuranceCovered;
    private BigDecimal insuranceCoveragePercentage;
    private BigDecimal insuranceAmount;
    private String notes;
    
    // Inventory item information
    private Long inventoryItemId;
    private String sku;
    private String inventoryItemName;
    private String inventoryCategoryName;
} 