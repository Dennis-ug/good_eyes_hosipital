package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.SurgeryReportConsumable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryReportConsumableDto {
    private Long id;
    private Long consumableItemId;
    private String consumableItemName;
    private String consumableItemSku;
    private BigDecimal quantityUsed;
    private String notes;

    public static SurgeryReportConsumableDto fromEntity(SurgeryReportConsumable entity) {
        SurgeryReportConsumableDto dto = new SurgeryReportConsumableDto();
        dto.setId(entity.getId());
        dto.setConsumableItemId(entity.getConsumableItem().getId());
        dto.setConsumableItemName(entity.getConsumableItem().getName());
        dto.setConsumableItemSku(entity.getConsumableItem().getSku());
        dto.setQuantityUsed(entity.getQuantityUsed());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
