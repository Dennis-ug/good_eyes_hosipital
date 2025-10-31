package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.entity.InventoryItem;
import com.rossumtechsystems.eyesante_backend.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryDrugService {

    private final InventoryItemRepository inventoryItemRepository;

    /**
     * Search for drugs in inventory by name (case-insensitive)
     */
    public List<InventoryItem> searchDrugsByName(String name) {
        log.info("Searching for drugs with name containing: {}", name);
        return inventoryItemRepository.findByCategoryNameAndNameContainingIgnoreCase("DRUGS", name);
    }

    /**
     * Get all available drugs (in stock)
     */
    public List<InventoryItem> getAvailableDrugs() {
        log.info("Fetching all available drugs");
        return inventoryItemRepository.findByCategoryNameAndQuantityInStockGreaterThan("DRUGS", 0);
    }

    /**
     * Get drugs by category
     */
    public List<InventoryItem> getDrugsByCategory(String categoryName) {
        log.info("Fetching drugs by category: {}", categoryName);
        return inventoryItemRepository.findByCategoryName(categoryName);
    }

    /**
     * Get drugs that are low in stock
     */
    public List<InventoryItem> getLowStockDrugs() {
        log.info("Fetching drugs that are low in stock");
        return inventoryItemRepository.findByCategoryNameAndQuantityInStockLessThanEqual("DRUGS", 10);
    }

    /**
     * Get drug by SKU
     */
    public Optional<InventoryItem> getDrugBySku(String sku) {
        log.info("Fetching drug by SKU: {}", sku);
        return inventoryItemRepository.findByCategoryNameAndSku("DRUGS", sku);
    }

    /**
     * Get drugs that are expiring soon (within 30 days)
     */
    public List<InventoryItem> getExpiringDrugs() {
        log.info("Fetching drugs that are expiring soon");
        LocalDate thresholdDate = LocalDate.now().plusDays(30);
        return inventoryItemRepository.findExpiringDrugs(thresholdDate);
    }

    /**
     * Get drugs that require prescription
     */
    public List<InventoryItem> getPrescriptionDrugs() {
        log.info("Fetching prescription drugs");
        return inventoryItemRepository.findPrescriptionDrugs();
    }

    /**
     * Get controlled substances
     */
    public List<InventoryItem> getControlledSubstances() {
        log.info("Fetching controlled substances");
        return inventoryItemRepository.findControlledSubstances();
    }

    /**
     * Get drug by ID
     */
    public Optional<InventoryItem> getDrugById(Long id) {
        log.info("Fetching drug by ID: {}", id);
        return inventoryItemRepository.findById(id);
    }

    /**
     * Check if drug is available in sufficient quantity
     */
    public boolean isDrugAvailable(Long drugId, Integer requiredQuantity) {
        Optional<InventoryItem> drug = inventoryItemRepository.findById(drugId);
        return drug.isPresent() &&
               drug.get().getCategory() != null &&
               "DRUGS".equals(drug.get().getCategory().getName()) &&
               drug.get().getQuantityInStock() >= requiredQuantity;
    }

    /**
     * Get drug stock level
     */
    public Integer getDrugStockLevel(Long drugId) {
        Optional<InventoryItem> drug = inventoryItemRepository.findById(drugId);
        return drug.map(InventoryItem::getQuantityInStock).orElse(0);
    }

    /**
     * Search drugs with advanced filters
     */
    public List<InventoryItem> searchDrugsAdvanced(String name, String category, Boolean inStock, Double minPrice, Double maxPrice) {
        log.info("Advanced drug search with filters: name={}, category={}, inStock={}, minPrice={}, maxPrice={}", 
                name, category, inStock, minPrice, maxPrice);
        return inventoryItemRepository.findDrugsWithAdvancedFilters(name, category, inStock, minPrice, maxPrice);
    }
} 