package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.TheaterStoreItem;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterStoreItemDto {
    private Long id;
    private Long theaterStoreId;
    private String theaterStoreName;
    private Long consumableItemId;
    private String consumableItemName;
    private String consumableItemSku;
    private BigDecimal quantityAvailable;
    private BigDecimal minimumQuantity;
    private BigDecimal maximumQuantity;
    private String batchNumber;
    private Boolean isSterile;

    public static TheaterStoreItemDto fromEntity(TheaterStoreItem entity) {
        TheaterStoreItemDto dto = new TheaterStoreItemDto();
        dto.setId(entity.getId());
        dto.setTheaterStoreId(entity.getTheaterStore().getId());
        dto.setTheaterStoreName(entity.getTheaterStore().getName());
        dto.setConsumableItemId(entity.getConsumableItem().getId());
        dto.setConsumableItemName(entity.getConsumableItem().getName());
        dto.setConsumableItemSku(entity.getConsumableItem().getSku());
        dto.setQuantityAvailable(entity.getQuantityAvailable());
        dto.setMinimumQuantity(entity.getMinimumQuantity());
        dto.setMaximumQuantity(entity.getMaximumQuantity());
        dto.setBatchNumber(entity.getBatchNumber());
        dto.setIsSterile(entity.getIsSterile());
        return dto;
    }
}
