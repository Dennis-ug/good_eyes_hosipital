package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.TheaterStore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterStoreDto {
    
    private Long id;
    private String name;
    private String description;
    private String location;
    private String storeType;
    private Integer capacity;
    private Boolean isActive;
    private Long managedByUserId;
    private String managedByUserName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer totalItems;
    private Integer totalStock;
    private List<String> itemNames;
    
    public static TheaterStoreDto fromEntity(TheaterStore theaterStore) {
        TheaterStoreDto dto = new TheaterStoreDto();
        dto.setId(theaterStore.getId());
        dto.setName(theaterStore.getName());
        dto.setDescription(theaterStore.getDescription());
        dto.setLocation(theaterStore.getLocation());
        dto.setStoreType(theaterStore.getStoreType());
        dto.setCapacity(theaterStore.getCapacity());
        dto.setIsActive(theaterStore.getIsActive());
        dto.setCreatedAt(theaterStore.getCreatedAt());
        dto.setUpdatedAt(theaterStore.getUpdatedAt());
        
        if (theaterStore.getManagedBy() != null) {
            dto.setManagedByUserId(theaterStore.getManagedBy().getId());
            dto.setManagedByUserName(theaterStore.getManagedBy().getFirstName() + " " + theaterStore.getManagedBy().getLastName());
        }
        
        // Calculate total items and stock
        if (theaterStore.getStoreItems() != null) {
            dto.setTotalItems(theaterStore.getStoreItems().size());
            dto.setTotalStock(theaterStore.getStoreItems().stream()
                .mapToInt(item -> item.getQuantityAvailable() != null ? item.getQuantityAvailable().intValue() : 0)
                .sum());
            
            // Extract item names
            dto.setItemNames(theaterStore.getStoreItems().stream()
                .map(item -> item.getConsumableItem() != null ? item.getConsumableItem().getName() : "Unknown Item")
                .distinct()
                .collect(Collectors.toList()));
        } else {
            dto.setTotalItems(0);
            dto.setTotalStock(0);
            dto.setItemNames(List.of());
        }
        
        return dto;
    }
}
