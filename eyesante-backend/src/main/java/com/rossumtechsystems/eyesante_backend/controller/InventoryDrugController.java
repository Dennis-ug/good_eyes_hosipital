package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.entity.InventoryItem;
import com.rossumtechsystems.eyesante_backend.service.InventoryDrugService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory/drugs")
@RequiredArgsConstructor
@Slf4j
public class InventoryDrugController {

    private final InventoryDrugService inventoryDrugService;

    /**
     * Search for drugs by name
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<List<InventoryItem>> searchDrugsByName(@RequestParam String name) {
        log.info("Doctor searching for drugs with name: {}", name);
        List<InventoryItem> drugs = inventoryDrugService.searchDrugsByName(name);
        return ResponseEntity.ok(drugs);
    }

    /**
     * Get all available drugs
     */
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<List<InventoryItem>> getAvailableDrugs() {
        log.info("Doctor requesting available drugs");
        List<InventoryItem> drugs = inventoryDrugService.getAvailableDrugs();
        return ResponseEntity.ok(drugs);
    }

    /**
     * Get drugs by category
     */
    @GetMapping("/category/{categoryName}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<List<InventoryItem>> getDrugsByCategory(@PathVariable String categoryName) {
        log.info("Doctor requesting drugs by category: {}", categoryName);
        List<InventoryItem> drugs = inventoryDrugService.getDrugsByCategory(categoryName);
        return ResponseEntity.ok(drugs);
    }

    /**
     * Get low stock drugs
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<List<InventoryItem>> getLowStockDrugs() {
        log.info("Doctor requesting low stock drugs");
        List<InventoryItem> drugs = inventoryDrugService.getLowStockDrugs();
        return ResponseEntity.ok(drugs);
    }

    /**
     * Get drug by SKU
     */
    @GetMapping("/sku/{sku}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<InventoryItem> getDrugBySku(@PathVariable String sku) {
        log.info("Doctor requesting drug by SKU: {}", sku);
        Optional<InventoryItem> drug = inventoryDrugService.getDrugBySku(sku);
        return drug.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get drug by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<InventoryItem> getDrugById(@PathVariable Long id) {
        log.info("Doctor requesting drug by ID: {}", id);
        Optional<InventoryItem> drug = inventoryDrugService.getDrugById(id);
        return drug.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Check if drug is available in sufficient quantity
     */
    @GetMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<Boolean> isDrugAvailable(@PathVariable Long id, @RequestParam Integer quantity) {
        log.info("Doctor checking availability for drug ID: {} with quantity: {}", id, quantity);
        boolean available = inventoryDrugService.isDrugAvailable(id, quantity);
        return ResponseEntity.ok(available);
    }

    /**
     * Get drug stock level
     */
    @GetMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<Integer> getDrugStockLevel(@PathVariable Long id) {
        log.info("Doctor requesting stock level for drug ID: {}", id);
        Integer stockLevel = inventoryDrugService.getDrugStockLevel(id);
        return ResponseEntity.ok(stockLevel);
    }

    /**
     * Advanced drug search with filters
     */
    @GetMapping("/advanced-search")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<List<InventoryItem>> searchDrugsAdvanced(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        
        log.info("Doctor performing advanced drug search with filters: name={}, category={}, inStock={}, minPrice={}, maxPrice={}", 
                name, category, inStock, minPrice, maxPrice);
        
        List<InventoryItem> drugs = inventoryDrugService.searchDrugsAdvanced(name, category, inStock, minPrice, maxPrice);
        return ResponseEntity.ok(drugs);
    }

    /**
     * Get drugs that are expiring soon
     */
    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<List<InventoryItem>> getExpiringDrugs() {
        log.info("Doctor requesting expiring drugs");
        List<InventoryItem> drugs = inventoryDrugService.getExpiringDrugs();
        return ResponseEntity.ok(drugs);
    }

    /**
     * Get prescription drugs
     */
    @GetMapping("/prescription")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<List<InventoryItem>> getPrescriptionDrugs() {
        log.info("Doctor requesting prescription drugs");
        List<InventoryItem> drugs = inventoryDrugService.getPrescriptionDrugs();
        return ResponseEntity.ok(drugs);
    }

    /**
     * Get controlled substances
     */
    @GetMapping("/controlled")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN')")
    public ResponseEntity<List<InventoryItem>> getControlledSubstances() {
        log.info("Doctor requesting controlled substances");
        List<InventoryItem> drugs = inventoryDrugService.getControlledSubstances();
        return ResponseEntity.ok(drugs);
    }
} 