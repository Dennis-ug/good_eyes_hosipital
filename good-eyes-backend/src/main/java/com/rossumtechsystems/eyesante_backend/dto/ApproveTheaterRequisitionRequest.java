package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveTheaterRequisitionRequest {
    private String action; // APPROVE, REJECT
    private String rejectionReason;
    private List<TheaterRequisitionItemApproval> itemApprovals;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TheaterRequisitionItemApproval {
        private Long requisitionItemId;
        private Double quantityApproved;
        private String notes;
    }
}













