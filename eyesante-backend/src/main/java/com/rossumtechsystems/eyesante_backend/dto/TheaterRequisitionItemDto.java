package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.TheaterRequisitionItem;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterRequisitionItemDto {
    private Long id;
    private Long requisitionId;
    private Long consumableItemId;
    private String consumableItemName;
    private String consumableItemSku;
    private String consumableItemUnit;
    private BigDecimal quantityRequested;
    private BigDecimal quantityApproved;
    private BigDecimal quantityFulfilled;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private String purpose;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static TheaterRequisitionItemDto fromEntity(TheaterRequisitionItem entity) {
        TheaterRequisitionItemDto dto = new TheaterRequisitionItemDto();
        dto.setId(entity.getId());
        dto.setQuantityRequested(entity.getQuantityRequested());
        dto.setQuantityApproved(entity.getQuantityApproved());
        dto.setQuantityFulfilled(entity.getQuantityFulfilled());
        dto.setUnitCost(entity.getUnitCost());
        dto.setTotalCost(entity.getTotalCost());
        dto.setPurpose(entity.getPurpose());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getRequisition() != null) {
            dto.setRequisitionId(entity.getRequisition().getId());
        }
        
        if (entity.getConsumableItem() != null) {
            dto.setConsumableItemId(entity.getConsumableItem().getId());
            dto.setConsumableItemName(entity.getConsumableItem().getName());
            dto.setConsumableItemSku(entity.getConsumableItem().getSku());
            dto.setConsumableItemUnit(entity.getConsumableItem().getUnitOfMeasure());
        }
        
        return dto;
    }
}













