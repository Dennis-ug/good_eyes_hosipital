package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTheaterRequisitionRequest {
    private String title;
    private String description;
    private LocalDate requiredDate;
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    private Long departmentId;
    private Long patientProcedureId;
    private String notes;
    private List<TheaterRequisitionItemRequest> requisitionItems;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TheaterRequisitionItemRequest {
        private Long consumableItemId;
        private Double quantityRequested;
        private String purpose;
        private String notes;
    }
}













