package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreateTheaterStoreRequest;
import com.rossumtechsystems.eyesante_backend.dto.TheaterStoreDto;
import com.rossumtechsystems.eyesante_backend.dto.TheaterStoreItemDto;
import com.rossumtechsystems.eyesante_backend.service.TheaterStoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/theater-stores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TheaterStoreController {
    
    private final TheaterStoreService theaterStoreService;
    
    // Create a new theater store
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<TheaterStoreDto> createTheaterStore(@Valid @RequestBody CreateTheaterStoreRequest request) {
        TheaterStoreDto theaterStore = theaterStoreService.createTheaterStore(request);
        return ResponseEntity.ok(theaterStore);
    }
    
    // Get all theater stores with pagination
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST')")
    public ResponseEntity<Page<TheaterStoreDto>> getAllTheaterStores(Pageable pageable) {
        Page<TheaterStoreDto> theaterStores = theaterStoreService.getAllTheaterStores(pageable);
        return ResponseEntity.ok(theaterStores);
    }
    
    // Get all active theater stores (no pagination)
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST')")
    public ResponseEntity<List<TheaterStoreDto>> getAllActiveTheaterStores() {
        List<TheaterStoreDto> theaterStores = theaterStoreService.getAllActiveTheaterStores();
        return ResponseEntity.ok(theaterStores);
    }
    
    // Get theater store by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST')")
    public ResponseEntity<TheaterStoreDto> getTheaterStoreById(@PathVariable Long id) {
        TheaterStoreDto theaterStore = theaterStoreService.getTheaterStoreById(id);
        return ResponseEntity.ok(theaterStore);
    }
    
    // Update theater store
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<TheaterStoreDto> updateTheaterStore(@PathVariable Long id, @Valid @RequestBody CreateTheaterStoreRequest request) {
        TheaterStoreDto theaterStore = theaterStoreService.updateTheaterStore(id, request);
        return ResponseEntity.ok(theaterStore);
    }
    
    // Delete theater store
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteTheaterStore(@PathVariable Long id) {
        theaterStoreService.deleteTheaterStore(id);
        return ResponseEntity.noContent().build();
    }
    
    // Get theater stores by store type
    @GetMapping("/type/{storeType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST')")
    public ResponseEntity<List<TheaterStoreDto>> getTheaterStoresByType(@PathVariable String storeType) {
        List<TheaterStoreDto> theaterStores = theaterStoreService.getTheaterStoresByType(storeType);
        return ResponseEntity.ok(theaterStores);
    }
    
    // Get theater stores by location
    @GetMapping("/location/{location}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST')")
    public ResponseEntity<List<TheaterStoreDto>> getTheaterStoresByLocation(@PathVariable String location) {
        List<TheaterStoreDto> theaterStores = theaterStoreService.getTheaterStoresByLocation(location);
        return ResponseEntity.ok(theaterStores);
    }
    
    // Get theater stores managed by a specific user
    @GetMapping("/manager/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<List<TheaterStoreDto>> getTheaterStoresByManager(@PathVariable Long userId) {
        List<TheaterStoreDto> theaterStores = theaterStoreService.getTheaterStoresByManager(userId);
        return ResponseEntity.ok(theaterStores);
    }
    
    // Get all consumable items available in theater stores
    @GetMapping("/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST')")
    public ResponseEntity<List<TheaterStoreItemDto>> getTheaterStoreItems() {
        List<TheaterStoreItemDto> items = theaterStoreService.getAllTheaterStoreItems();
        return ResponseEntity.ok(items);
    }
    
    // Delete theater store item (returns quantity to main store)
    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'ACCOUNT_STORE_MANAGER')")
    public ResponseEntity<Void> deleteTheaterStoreItem(@PathVariable Long id) {
        theaterStoreService.deleteTheaterStoreItem(id);
        return ResponseEntity.noContent().build();
    }
}
