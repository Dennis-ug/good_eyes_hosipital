package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.*;
import com.rossumtechsystems.eyesante_backend.service.TheaterProcedureUsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/theater-procedure-usage")
@CrossOrigin(origins = "*")
public class TheaterProcedureUsageController {
    
    @Autowired
    private TheaterProcedureUsageService usageService;
    
    // Record usage during procedure
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterProcedureUsageDto>> recordProcedureUsage(@RequestBody CreateTheaterProcedureUsageRequest request) {
        List<TheaterProcedureUsageDto> usage = usageService.recordProcedureUsage(request);
        return ResponseEntity.ok(usage);
    }
    
    // Get usage by patient procedure
    @GetMapping("/procedure/{procedureId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterProcedureUsageDto>> getUsageByProcedure(@PathVariable Long procedureId) {
        List<TheaterProcedureUsageDto> usage = usageService.getUsageByProcedure(procedureId);
        return ResponseEntity.ok(usage);
    }
    
    // Get usage by consumable item
    @GetMapping("/consumable/{consumableItemId}")
    @PreAuthorize("hasAnyRole('ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterProcedureUsageDto>> getUsageByConsumableItem(@PathVariable Long consumableItemId) {
        List<TheaterProcedureUsageDto> usage = usageService.getUsageByConsumableItem(consumableItemId);
        return ResponseEntity.ok(usage);
    }
    
    // Get usage by user
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterProcedureUsageDto>> getUsageByUser(@PathVariable Long userId) {
        List<TheaterProcedureUsageDto> usage = usageService.getUsageByUser(userId);
        return ResponseEntity.ok(usage);
    }
    
    // Get usage by date range
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterProcedureUsageDto>> getUsageByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        List<TheaterProcedureUsageDto> usage = usageService.getUsageByDateRange(start, end);
        return ResponseEntity.ok(usage);
    }
    
    // Get usage by theater store
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterProcedureUsageDto>> getUsageByTheaterStore(@PathVariable Long storeId) {
        List<TheaterProcedureUsageDto> usage = usageService.getUsageByTheaterStore(storeId);
        return ResponseEntity.ok(usage);
    }
    
    // Get all usage records
    @GetMapping
    @PreAuthorize("hasAnyRole('ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterProcedureUsageDto>> getAllUsage() {
        List<TheaterProcedureUsageDto> usage = usageService.getAllUsage();
        return ResponseEntity.ok(usage);
    }
}













