package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreateInventoryCategoryRequest;
import com.rossumtechsystems.eyesante_backend.dto.InventoryCategoryDto;
import com.rossumtechsystems.eyesante_backend.service.InventoryCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/categories")
@CrossOrigin(origins = "*")
public class InventoryCategoryController {

    @Autowired
    private InventoryCategoryService inventoryCategoryService;

    // Create category
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<InventoryCategoryDto> createCategory(@Valid @RequestBody CreateInventoryCategoryRequest request) {
        InventoryCategoryDto category = inventoryCategoryService.createCategory(request);
        return ResponseEntity.ok(category);
    }

    // Get category by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InventoryCategoryDto> getCategoryById(@PathVariable Long id) {
        InventoryCategoryDto category = inventoryCategoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    // Get category by name
    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InventoryCategoryDto> getCategoryByName(@PathVariable String name) {
        InventoryCategoryDto category = inventoryCategoryService.getCategoryByName(name);
        return ResponseEntity.ok(category);
    }

    // Get all active categories
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InventoryCategoryDto>> getAllActiveCategories() {
        List<InventoryCategoryDto> categories = inventoryCategoryService.getAllActiveCategories();
        return ResponseEntity.ok(categories);
    }

    // Get all categories with pagination
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryCategoryDto>> getAllCategories(Pageable pageable) {
        Page<InventoryCategoryDto> categories = inventoryCategoryService.getAllCategories(pageable);
        return ResponseEntity.ok(categories);
    }

    // Search categories by name
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InventoryCategoryDto>> searchCategoriesByName(@RequestParam String name) {
        List<InventoryCategoryDto> categories = inventoryCategoryService.searchCategoriesByName(name);
        return ResponseEntity.ok(categories);
    }

    // Update category
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<InventoryCategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody CreateInventoryCategoryRequest request) {
        InventoryCategoryDto category = inventoryCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(category);
    }

    // Delete category
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        inventoryCategoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
} 