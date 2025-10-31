package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreateInventoryItemRequest;
import com.rossumtechsystems.eyesante_backend.dto.InventoryItemDto;
import com.rossumtechsystems.eyesante_backend.entity.InventoryCategory;
import com.rossumtechsystems.eyesante_backend.entity.InventoryItem;
import com.rossumtechsystems.eyesante_backend.repository.InventoryCategoryRepository;
import com.rossumtechsystems.eyesante_backend.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rossumtechsystems.eyesante_backend.dto.UpdateInventoryItemRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;

    private final InventoryCategoryRepository inventoryCategoryRepository;

    public InventoryItemDto createItem(CreateInventoryItemRequest request) {
        InventoryCategory category = inventoryCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));

        if (request.getSku() != null && inventoryItemRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Item with SKU '" + request.getSku() + "' already exists");
        }

        InventoryItem item = new InventoryItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setSku(request.getSku());
        item.setUnitPrice(request.getUnitPrice());
        item.setCostPrice(request.getCostPrice());
        item.setQuantityInStock(request.getQuantityInStock());
        item.setMinimumStockLevel(request.getMinimumStockLevel());
        item.setMaximumStockLevel(request.getMaximumStockLevel());
        item.setUnitOfMeasure(request.getUnitOfMeasure());
        item.setCategory(category);
        item.setSupplierName(request.getSupplierName());
        item.setSupplierContact(request.getSupplierContact());
        item.setReorderPoint(request.getReorderPoint());
        item.setReorderQuantity(request.getReorderQuantity());
        item.setIsActive(true);

        // Optional medicine fields
        item.setGenericName(request.getGenericName());
        item.setDosageForm(request.getDosageForm());
        item.setStrength(request.getStrength());
        item.setActiveIngredient(request.getActiveIngredient());
        item.setExpiryDate(request.getExpiryDate());
        item.setBatchNumber(request.getBatchNumber());
        item.setRequiresPrescription(request.getRequiresPrescription());
        item.setControlledSubstance(request.getControlledSubstance());
        item.setStorageConditions(request.getStorageConditions());

        InventoryItem savedItem = inventoryItemRepository.save(item);
        return convertToDto(savedItem);
    }

    public InventoryItemDto getItemById(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + id));
        return convertToDto(item);
    }

    public List<InventoryItemDto> getAllActiveItems() {
        return inventoryItemRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Page<InventoryItemDto> getAllItems(Pageable pageable, String search) {
        if (search != null && !search.trim().isEmpty()) {
            // Use case-insensitive search across name, SKU, and category
            return inventoryItemRepository.findByIsActiveTrueAndNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrCategoryNameContainingIgnoreCase(
                    search.trim(), search.trim(), search.trim(), pageable)
                    .map(this::convertToDto);
        } else {
            return inventoryItemRepository.findByIsActiveTrue(pageable)
                    .map(this::convertToDto);
        }
    }

    public List<InventoryItemDto> getItemsByCategory(Long categoryId) {
        return inventoryItemRepository.findByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDto> getLowStockItems() {
        return inventoryItemRepository.findByQuantityInStockLessThanEqualAndIsActiveTrue(0)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDto> searchItemsByName(String name) {
        return inventoryItemRepository.findActiveByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDto> getAvailableItemsForInvoice() {
        return inventoryItemRepository.findByQuantityInStockGreaterThanAndIsActiveTrue(0)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public InventoryItemDto updateStockQuantity(Long id, Integer newQuantity) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + id));

        item.setQuantityInStock(newQuantity);
        InventoryItem savedItem = inventoryItemRepository.save(item);
        return convertToDto(savedItem);
    }

    public void deleteItem(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + id));

        item.setIsActive(false);
        inventoryItemRepository.save(item);
    }

    public InventoryItemDto updateItem(Long id, UpdateInventoryItemRequest request) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + id));

        if (request.getName() != null) item.setName(request.getName());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getSku() != null) item.setSku(request.getSku());
        if (request.getUnitPrice() != null) item.setUnitPrice(request.getUnitPrice());
        if (request.getCostPrice() != null) item.setCostPrice(request.getCostPrice());
        if (request.getMinimumStockLevel() != null) item.setMinimumStockLevel(request.getMinimumStockLevel());
        if (request.getMaximumStockLevel() != null) item.setMaximumStockLevel(request.getMaximumStockLevel());
        if (request.getUnitOfMeasure() != null) item.setUnitOfMeasure(request.getUnitOfMeasure());
        if (request.getCategoryId() != null) {
            InventoryCategory category = inventoryCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));
            item.setCategory(category);
        }
        if (request.getSupplierName() != null) item.setSupplierName(request.getSupplierName());
        if (request.getSupplierContact() != null) item.setSupplierContact(request.getSupplierContact());
        if (request.getReorderPoint() != null) item.setReorderPoint(request.getReorderPoint());
        if (request.getReorderQuantity() != null) item.setReorderQuantity(request.getReorderQuantity());

        // Medicine fields
        if (request.getGenericName() != null) item.setGenericName(request.getGenericName());
        if (request.getDosageForm() != null) item.setDosageForm(request.getDosageForm());
        if (request.getStrength() != null) item.setStrength(request.getStrength());
        if (request.getActiveIngredient() != null) item.setActiveIngredient(request.getActiveIngredient());
        if (request.getExpiryDate() != null) item.setExpiryDate(request.getExpiryDate());
        if (request.getBatchNumber() != null) item.setBatchNumber(request.getBatchNumber());
        if (request.getRequiresPrescription() != null) item.setRequiresPrescription(request.getRequiresPrescription());
        if (request.getControlledSubstance() != null) item.setControlledSubstance(request.getControlledSubstance());
        if (request.getStorageConditions() != null) item.setStorageConditions(request.getStorageConditions());

        InventoryItem saved = inventoryItemRepository.save(item);
        return convertToDto(saved);
    }

    private InventoryItemDto convertToDto(InventoryItem item) {
        InventoryItemDto dto = new InventoryItemDto();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setSku(item.getSku());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setCostPrice(item.getCostPrice());
        dto.setQuantityInStock(item.getQuantityInStock());
        dto.setMinimumStockLevel(item.getMinimumStockLevel());
        dto.setMaximumStockLevel(item.getMaximumStockLevel());
        dto.setUnitOfMeasure(item.getUnitOfMeasure());
        dto.setIsActive(item.getIsActive());
        
        if (item.getCategory() != null) {
            dto.setCategoryId(item.getCategory().getId());
            dto.setCategoryName(item.getCategory().getName());
        }
        
        dto.setSupplierName(item.getSupplierName());
        dto.setSupplierContact(item.getSupplierContact());
        dto.setReorderPoint(item.getReorderPoint());
        dto.setReorderQuantity(item.getReorderQuantity());
        
        if (item.getQuantityInStock() == 0) {
            dto.setStockStatus("OUT_OF_STOCK");
        } else if (item.getMinimumStockLevel() != null && item.getQuantityInStock() <= item.getMinimumStockLevel()) {
            dto.setStockStatus("LOW_STOCK");
        } else {
            dto.setStockStatus("IN_STOCK");
        }
        
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        dto.setCreatedBy(item.getCreatedBy());
        dto.setUpdatedBy(item.getUpdatedBy());

        // Medicine fields
        dto.setGenericName(item.getGenericName());
        dto.setDosageForm(item.getDosageForm());
        dto.setStrength(item.getStrength());
        dto.setActiveIngredient(item.getActiveIngredient());
        dto.setExpiryDate(item.getExpiryDate());
        dto.setBatchNumber(item.getBatchNumber());
        dto.setRequiresPrescription(item.getRequiresPrescription());
        dto.setControlledSubstance(item.getControlledSubstance());
        dto.setStorageConditions(item.getStorageConditions());
        
        return dto;
    }
}
