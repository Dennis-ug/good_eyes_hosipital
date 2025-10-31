package com.rossumtechsystems.eyesante_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvoiceRequest {
    
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    private Long appointmentId; // Optional - for appointment-based invoices
    
    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;
    
    private LocalDate dueDate;
    
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    private String notes;
    
    private String internalNotes;
    
    // Insurance Information
    private String insuranceProvider;
    
    private String insuranceNumber;
    
    private BigDecimal insuranceCoverage;
    
    // Invoice Items - can be custom items or inventory items
    @NotNull(message = "At least one invoice item is required")
    @Size(min = 1, message = "At least one invoice item is required")
    @Valid
    private List<CreateInvoiceItemRequest> invoiceItems;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateInvoiceItemRequest {
        
        @NotNull(message = "Item name is required")
        private String itemName;
        
        private String itemDescription;
        
        @NotNull(message = "Item type is required")
        private String itemType; // CONSULTATION, MEDICATION, PROCEDURE, LAB_TEST, INVENTORY_ITEM, etc.
        
        @NotNull(message = "Quantity is required")
        private Integer quantity = 1;
        
        @NotNull(message = "Unit price is required")
        private BigDecimal unitPrice;
        
        private BigDecimal discountPercentage;
        
        private BigDecimal taxPercentage;
        
        private Boolean insuranceCovered = false;
        
        private BigDecimal insuranceCoveragePercentage;
        
        private String notes;
        
        // Inventory item specific fields
        private Long inventoryItemId; // If this is an inventory item
        
        private String sku; // Stock Keeping Unit for inventory items
    }
} 