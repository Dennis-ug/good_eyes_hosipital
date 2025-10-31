package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreateInventoryItemRequest;
import com.rossumtechsystems.eyesante_backend.dto.InventoryItemDto;
import com.rossumtechsystems.eyesante_backend.service.InventoryItemService;
import com.rossumtechsystems.eyesante_backend.dto.UpdateInventoryItemRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/items")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    // Create item
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<InventoryItemDto> createItem(@Valid @RequestBody CreateInventoryItemRequest request) {
        InventoryItemDto item = inventoryItemService.createItem(request);
        return ResponseEntity.ok(item);
    }

    // Get item by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InventoryItemDto> getItemById(@PathVariable Long id) {
        InventoryItemDto item = inventoryItemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    // Get all active items
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InventoryItemDto>> getAllActiveItems() {
        List<InventoryItemDto> items = inventoryItemService.getAllActiveItems();
        return ResponseEntity.ok(items);
    }

    // Get all items with pagination and optional search
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> getAllItems(Pageable pageable, @RequestParam(required = false) String search) {
        Page<InventoryItemDto> items = inventoryItemService.getAllItems(pageable, search);
        return ResponseEntity.ok(items);
    }

    // Update item
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<InventoryItemDto> updateItem(@PathVariable Long id, @Valid @RequestBody UpdateInventoryItemRequest request) {
        InventoryItemDto item = inventoryItemService.updateItem(id, request);
        return ResponseEntity.ok(item);
    }

    // Get items by category
    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InventoryItemDto>> getItemsByCategory(@PathVariable Long categoryId) {
        List<InventoryItemDto> items = inventoryItemService.getItemsByCategory(categoryId);
        return ResponseEntity.ok(items);
    }

    // Get low stock items
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InventoryItemDto>> getLowStockItems() {
        List<InventoryItemDto> items = inventoryItemService.getLowStockItems();
        return ResponseEntity.ok(items);
    }

    // Search items by name
    @GetMapping("/search/name")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InventoryItemDto>> searchItemsByName(@RequestParam String name) {
        List<InventoryItemDto> items = inventoryItemService.searchItemsByName(name);
        return ResponseEntity.ok(items);
    }

    // Get available items for invoicing (items with stock > 0)
    @GetMapping("/available-for-invoice")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InventoryItemDto>> getAvailableItemsForInvoice() {
        List<InventoryItemDto> items = inventoryItemService.getAvailableItemsForInvoice();
        return ResponseEntity.ok(items);
    }

    // Update stock quantity
    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<InventoryItemDto> updateStockQuantity(@PathVariable Long id, @RequestParam Integer quantity) {
        InventoryItemDto item = inventoryItemService.updateStockQuantity(id, quantity);
        return ResponseEntity.ok(item);
    }

    // Delete item
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryItemService.deleteItem(id);
        return ResponseEntity.ok().build();
    }
} 