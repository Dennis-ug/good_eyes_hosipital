package com.rossumtechsystems.eyesante_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientTreatmentDto {
    private Long id;
    private Long visitSessionId;
    private Long inventoryItemId;
    private String itemName;
    private String sku;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String notes;
    private String dosage;
    private String administrationRoute;
}


