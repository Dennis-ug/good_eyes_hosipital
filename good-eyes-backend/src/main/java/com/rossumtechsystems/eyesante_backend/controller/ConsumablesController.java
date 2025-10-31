package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.*;
import com.rossumtechsystems.eyesante_backend.service.ConsumablesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/consumables")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER')")
public class ConsumablesController {
    
    @Autowired
    private ConsumablesService consumablesService;
    
    // Category Management
    @GetMapping("/categories")
    public ResponseEntity<Page<ConsumableCategoryDto>> getAllCategories(Pageable pageable) {
        Page<ConsumableCategoryDto> categories = consumablesService.getAllCategories(pageable);
        return ResponseEntity.ok(categories);
    }
    
    @PostMapping("/categories")
    public ResponseEntity<ConsumableCategoryDto> createCategory(@RequestBody CreateConsumableCategoryRequest request) {
        ConsumableCategoryDto category = consumablesService.createCategory(request);
        return ResponseEntity.ok(category);
    }
    
    @GetMapping("/categories/{id}")
    public ResponseEntity<ConsumableCategoryDto> getCategoryById(@PathVariable Long id) {
        ConsumableCategoryDto category = consumablesService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }
    
    @PutMapping("/categories/{id}")
    public ResponseEntity<ConsumableCategoryDto> updateCategory(@PathVariable Long id, @RequestBody CreateConsumableCategoryRequest request) {
        ConsumableCategoryDto category = consumablesService.updateCategory(id, request);
        return ResponseEntity.ok(category);
    }
    
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        consumablesService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
    
    // Item Management
    @GetMapping("/items")
    public ResponseEntity<Page<ConsumableItemDto>> getAllItems(Pageable pageable) {
        Page<ConsumableItemDto> items = consumablesService.getAllItems(pageable);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/search")
    public ResponseEntity<List<ConsumableItemDto>> searchItems(@RequestParam String q) {
        List<ConsumableItemDto> items = consumablesService.searchConsumableItems(q);
        return ResponseEntity.ok(items);
    }
    
    @PostMapping("/items")
    public ResponseEntity<ConsumableItemDto> createItem(@RequestBody CreateConsumableItemRequest request) {
        ConsumableItemDto item = consumablesService.createItem(request);
        return ResponseEntity.ok(item);
    }
    
    @GetMapping("/items/{id}")
    public ResponseEntity<ConsumableItemDto> getItemById(@PathVariable Long id) {
        ConsumableItemDto item = consumablesService.getItemById(id);
        return ResponseEntity.ok(item);
    }
    
    @PutMapping("/items/{id}")
    public ResponseEntity<ConsumableItemDto> updateItem(@PathVariable Long id, @RequestBody CreateConsumableItemRequest request) {
        ConsumableItemDto item = consumablesService.updateItem(id, request);
        return ResponseEntity.ok(item);
    }
    
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        consumablesService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/items/{id}/soft")
    public ResponseEntity<Void> softDeleteItem(@PathVariable Long id) {
        consumablesService.softDeleteItem(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/items/{id}/stock")
    public ResponseEntity<ConsumableItemDto> updateStock(@PathVariable Long id, @RequestParam java.math.BigDecimal quantity) {
        ConsumableItemDto item = consumablesService.updateStock(id, quantity);
        return ResponseEntity.ok(item);
    }
    
    // Usage Management
    @PostMapping("/usage")
    public ResponseEntity<ConsumableUsageDto> recordUsage(@RequestBody CreateConsumableUsageRequest request) {
        ConsumableUsageDto usage = consumablesService.recordUsage(request);
        return ResponseEntity.ok(usage);
    }
    
    @GetMapping("/usage")
    public ResponseEntity<Page<ConsumableUsageDto>> getUsageHistory(Pageable pageable) {
        Page<ConsumableUsageDto> usage = consumablesService.getUsageHistory(pageable);
        return ResponseEntity.ok(usage);
    }
    
    // Reports
    @GetMapping("/reports/low-stock")
    public ResponseEntity<List<ConsumableItemDto>> getLowStockItems() {
        List<ConsumableItemDto> items = consumablesService.getLowStockItems();
        return ResponseEntity.ok(items);
    }
    
    @GetMapping("/reports/total-stock-value")
    public ResponseEntity<java.math.BigDecimal> getTotalStockValue() {
        java.math.BigDecimal value = consumablesService.getTotalStockValue();
        return ResponseEntity.ok(value);
    }
    
    @GetMapping("/reports/total-items-count")
    public ResponseEntity<Long> getTotalItemsCount() {
        Long count = consumablesService.getTotalItemsCount();
        return ResponseEntity.ok(count);
    }
    
    // Restock Management
    @PostMapping("/restock")
    public ResponseEntity<ConsumableRestockDto> recordRestock(@RequestBody CreateConsumableRestockRequest request) {
        ConsumableRestockDto restock = consumablesService.recordRestock(request);
        return ResponseEntity.ok(restock);
    }
}
