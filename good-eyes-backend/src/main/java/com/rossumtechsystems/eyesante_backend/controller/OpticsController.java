package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.InventoryItemDto;
import com.rossumtechsystems.eyesante_backend.service.OpticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/optics")
@CrossOrigin(origins = "*")
public class OpticsController {

    @Autowired
    private OpticsService opticsService;

    /**
     * Get all frame items (lenses are generated dynamically)
     */
    @GetMapping("/frames")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> getAllFrameItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.getAllFrameItems(pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get frame items by shape
     */
    @GetMapping("/frames/shape/{frameShape}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> getFramesByShape(
            @PathVariable String frameShape,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.getFramesByShape(frameShape, pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get frame items by material
     */
    @GetMapping("/frames/material/{frameMaterial}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> getFramesByMaterial(
            @PathVariable String frameMaterial,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.getFramesByMaterial(frameMaterial, pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get frame items by brand
     */
    @GetMapping("/frames/brand/{brand}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> getFramesByBrand(
            @PathVariable String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.getFrameItemsByBrand(brand, pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Search frame items
     */
    @GetMapping("/frames/search")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> searchFrameItems(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.searchFrameItems(query, pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get frame item by ID
     */
    @GetMapping("/frames/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<InventoryItemDto> getFrameItemById(@PathVariable Long id) {
        return opticsService.getFrameItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    /**
     * Check stock availability for frame item
     */
    @GetMapping("/frames/{id}/stock")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> checkFrameStockAvailability(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer requiredQuantity) {
        boolean available = opticsService.checkFrameStockAvailability(id, requiredQuantity);
        Map<String, Object> response = Map.of(
                "available", available,
                "itemId", id,
                "requiredQuantity", requiredQuantity
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get available frame shapes
     */
    @GetMapping("/frames/shapes")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAvailableFrameShapes() {
        List<String> shapes = opticsService.getAvailableFrameShapes();
        return ResponseEntity.ok(shapes);
    }

    /**
     * Get available frame materials
     */
    @GetMapping("/frames/materials")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAvailableFrameMaterials() {
        List<String> materials = opticsService.getAvailableFrameMaterials();
        return ResponseEntity.ok(materials);
    }


    /**
     * Get available brands (frames only)
     */
    @GetMapping("/frames/brands")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAvailableBrands() {
        List<String> brands = opticsService.getAvailableBrands();
        return ResponseEntity.ok(brands);
    }

    /**
     * Search all optical items (frames and lenses) from inventory
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> searchAllOpticalItems(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.searchAllOpticalItems(query, pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get all optical items (frames and lenses) from inventory
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> getAllOpticalItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.getAllOpticalItems(pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get optical items by type (FRAME or LENS) from inventory
     */
    @GetMapping("/type/{opticsType}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> getOpticalItemsByType(
            @PathVariable String opticsType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.getOpticalItemsByType(opticsType, pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get optical items by brand (frames and lenses) from inventory
     */
    @GetMapping("/brand/{brand}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InventoryItemDto>> getOpticalItemsByBrand(
            @PathVariable String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryItemDto> items = opticsService.getOpticalItemsByBrand(brand, pageable);
        return ResponseEntity.ok(items);
    }

    /**
     * Get available optical item brands (frames and lenses)
     */
    @GetMapping("/brands")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAvailableOpticalItemBrands() {
        List<String> brands = opticsService.getAvailableOpticalItemBrands();
        return ResponseEntity.ok(brands);
    }

    /**
     * Get available lens materials from inventory
     */
    @GetMapping("/lens-materials")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAvailableLensMaterialsFromInventory() {
        List<String> materials = opticsService.getAvailableLensMaterialsFromInventory();
        return ResponseEntity.ok(materials);
    }

    /**
     * Get available lens types from inventory
     */
    @GetMapping("/lens-types")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getAvailableLensTypesFromInventory() {
        List<String> types = opticsService.getAvailableLensTypesFromInventory();
        return ResponseEntity.ok(types);
    }

    /**
     * Validate frame selection for a visit session
     */
    @PostMapping("/validate-frame-selection")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> validateFrameSelection(
            @RequestParam Long visitSessionId,
            @RequestBody List<Long> frameItemIds) {
        boolean valid = opticsService.validateFrameSelection(visitSessionId, frameItemIds);
        Map<String, Object> response = Map.of(
                "valid", valid,
                "visitSessionId", visitSessionId,
                "itemCount", frameItemIds.size()
        );
        return ResponseEntity.ok(response);
    }

}
