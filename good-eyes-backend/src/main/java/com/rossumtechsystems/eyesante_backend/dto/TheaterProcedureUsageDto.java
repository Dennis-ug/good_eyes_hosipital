package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.TheaterProcedureUsage;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterProcedureUsageDto {
    private Long id;
    private Long patientProcedureId;
    private String patientProcedureName;
    private Long consumableItemId;
    private String consumableItemName;
    private String consumableItemSku;
    private Long theaterStoreId;
    private String theaterStoreName;
    private BigDecimal quantityUsed;
    private Long usedByUserId;
    private String usedByUserName;
    private LocalDateTime usageDate;
    private String batchNumber;
    private String purpose;
    private String notes;
    private LocalDateTime createdAt;
    
    public static TheaterProcedureUsageDto fromEntity(TheaterProcedureUsage entity) {
        TheaterProcedureUsageDto dto = new TheaterProcedureUsageDto();
        dto.setId(entity.getId());
        dto.setQuantityUsed(entity.getQuantityUsed());
        dto.setUsageDate(entity.getUsageDate());
        dto.setBatchNumber(entity.getBatchNumber());
        dto.setPurpose(entity.getPurpose());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        
        if (entity.getPatientProcedure() != null) {
            dto.setPatientProcedureId(entity.getPatientProcedure().getId());
            if (entity.getPatientProcedure().getProcedure() != null) {
                dto.setPatientProcedureName(entity.getPatientProcedure().getProcedure().getName());
            }
        }
        
        if (entity.getConsumableItem() != null) {
            dto.setConsumableItemId(entity.getConsumableItem().getId());
            dto.setConsumableItemName(entity.getConsumableItem().getName());
            dto.setConsumableItemSku(entity.getConsumableItem().getSku());
        }
        
        if (entity.getTheaterStore() != null) {
            dto.setTheaterStoreId(entity.getTheaterStore().getId());
            dto.setTheaterStoreName(entity.getTheaterStore().getName());
        }
        
        if (entity.getUsedBy() != null) {
            dto.setUsedByUserId(entity.getUsedBy().getId());
            dto.setUsedByUserName(entity.getUsedBy().getFirstName() + " " + entity.getUsedBy().getLastName());
        }
        
        return dto;
    }
}

