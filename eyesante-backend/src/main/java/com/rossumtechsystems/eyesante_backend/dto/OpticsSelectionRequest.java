package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;

@Data
public class OpticsSelectionRequest {
    private Long inventoryItemId;
    private Integer quantity = 1;
    private String notes;

    // Default constructor
    public OpticsSelectionRequest() {}

    // Constructor with fields
    public OpticsSelectionRequest(Long inventoryItemId, Integer quantity, String notes) {
        this.inventoryItemId = inventoryItemId;
        this.quantity = quantity != null ? quantity : 1;
        this.notes = notes;
    }

    // Getters and setters
    public Long getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(Long inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public Integer getQuantity() {
        return quantity != null ? quantity : 1;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity != null ? quantity : 1;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

