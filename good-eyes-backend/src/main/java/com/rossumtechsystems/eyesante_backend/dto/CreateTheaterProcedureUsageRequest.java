package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTheaterProcedureUsageRequest {
    private Long patientProcedureId;
    private List<TheaterProcedureUsageItem> usageItems;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TheaterProcedureUsageItem {
        private Long consumableItemId;
        private Long theaterStoreId;
        private Double quantityUsed;
        private String batchNumber;
        private String purpose;
        private String notes;
    }
}













