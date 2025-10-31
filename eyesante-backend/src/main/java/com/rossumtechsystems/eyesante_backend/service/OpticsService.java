package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.InventoryItemDto;
import com.rossumtechsystems.eyesante_backend.entity.InventoryItem;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.repository.InventoryItemRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OpticsService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private PatientVisitSessionRepository patientVisitSessionRepository;


    /**
     * Get all frame items (only frames, lenses are generated dynamically)
     */
    public Page<InventoryItemDto> getAllFrameItems(Pageable pageable) {
        return inventoryItemRepository.findAllFramesFromInventory(pageable)
                .map(this::toDto);
    }

    /**
     * Get frame items by shape
     */
    public Page<InventoryItemDto> getFramesByShape(String frameShape, Pageable pageable) {
        return inventoryItemRepository.findFramesByShapeFromInventory(frameShape, pageable)
                .map(this::toDto);
    }

    /**
     * Get frames by material
     */
    public Page<InventoryItemDto> getFramesByMaterial(String frameMaterial, Pageable pageable) {
        return inventoryItemRepository.findFramesByMaterialFromInventory(frameMaterial, pageable)
                .map(this::toDto);
    }

    /**
     * Get frame items by brand
     */
    public Page<InventoryItemDto> getFrameItemsByBrand(String brand, Pageable pageable) {
        return inventoryItemRepository.findFramesByBrandFromInventory(brand, pageable)
                .map(this::toDto);
    }

    /**
     * Search frame items
     */
    public Page<InventoryItemDto> searchFrameItems(String searchTerm, Pageable pageable) {
        return inventoryItemRepository.searchFramesFromInventory(searchTerm, pageable)
                .map(this::toDto);
    }

    /**
     * Get frame item by ID
     */
    public Optional<InventoryItemDto> getFrameItemById(Long id) {
        return inventoryItemRepository.findById(id)
                .filter(item -> "FRAME".equals(item.getOpticsType()) || (item.getCategory() != null && "FRAMES".equals(item.getCategory().getName())))
                .map(this::toDto);
    }

    /**
     * Check stock availability for frame item
     */
    public boolean checkFrameStockAvailability(Long itemId, Integer requiredQuantity) {
        Optional<InventoryItem> item = inventoryItemRepository.findById(itemId);
        if (item.isEmpty() || !"FRAME".equals(item.get().getOpticsType())) return false;

        int availableStock = item.get().getQuantityInStock() != null ? item.get().getQuantityInStock() : 0;
        return availableStock >= requiredQuantity;
    }



    private InventoryItemDto toDto(InventoryItem item) {
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
        dto.setOpticsType(item.getOpticsType());
        dto.setFrameShape(item.getFrameShape());
        dto.setFrameSize(item.getFrameSize());
        dto.setFrameMaterial(item.getFrameMaterial());
        dto.setBrand(item.getBrand());
        dto.setModel(item.getModel());
        dto.setColor(item.getColor());
        return dto;
    }

    /**
     * Get available frame shapes
     */
    public List<String> getAvailableFrameShapes() {
        return inventoryItemRepository.findDistinctFrameShapes();
    }

    /**
     * Get available frame materials
     */
    public List<String> getAvailableFrameMaterials() {
        return inventoryItemRepository.findDistinctFrameMaterials();
    }


    /**
     * Get available brands (from frames only)
     */
    public List<String> getAvailableBrands() {
        return inventoryItemRepository.findDistinctBrands();
    }

    /**
     * Search all optical items (frames and lenses) from inventory
     */
    public Page<InventoryItemDto> searchAllOpticalItems(String searchTerm, Pageable pageable) {
        return inventoryItemRepository.searchAllOpticalItemsFromInventory(searchTerm, pageable)
                .map(this::toDto);
    }

    /**
     * Get all optical items (frames and lenses) from inventory
     */
    public Page<InventoryItemDto> getAllOpticalItems(Pageable pageable) {
        return inventoryItemRepository.findAllOpticalItemsFromInventory(pageable)
                .map(this::toDto);
    }

    /**
     * Get optical items by type (FRAME or LENS) from inventory
     */
    public Page<InventoryItemDto> getOpticalItemsByType(String opticsType, Pageable pageable) {
        String categoryName = opticsType.equals("FRAME") ? "FRAMES" : "LENSES";
        return inventoryItemRepository.findOpticalItemsByTypeFromInventory(opticsType, categoryName, pageable)
                .map(this::toDto);
    }

    /**
     * Get optical items by brand (frames and lenses) from inventory
     */
    public Page<InventoryItemDto> getOpticalItemsByBrand(String brand, Pageable pageable) {
        return inventoryItemRepository.findOpticalItemsByBrandFromInventory(brand, pageable)
                .map(this::toDto);
    }

    /**
     * Get available optical item brands (frames and lenses)
     */
    public List<String> getAvailableOpticalItemBrands() {
        return inventoryItemRepository.findDistinctOpticalItemBrands();
    }

    /**
     * Get available lens materials from inventory
     */
    public List<String> getAvailableLensMaterialsFromInventory() {
        return inventoryItemRepository.findDistinctLensMaterials();
    }

    /**
     * Get available lens types from inventory
     */
    public List<String> getAvailableLensTypesFromInventory() {
        return inventoryItemRepository.findDistinctLensTypes();
    }

    /**
     * Validate frame selection for a visit session
     */
    public boolean validateFrameSelection(Long visitSessionId, List<Long> frameItemIds) {
        // Check if visit session exists
        Optional<PatientVisitSession> visitSession = patientVisitSessionRepository.findById(visitSessionId);
        if (visitSession.isEmpty()) return false;

        // Check if all frame items exist and have sufficient stock
        for (Long itemId : frameItemIds) {
            if (!checkFrameStockAvailability(itemId, 1)) { // At least 1 unit required
                return false;
            }
        }

        return true;
    }

}
