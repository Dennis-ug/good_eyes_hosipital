package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.*;
import com.rossumtechsystems.eyesante_backend.service.TheaterRequisitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theater-requisitions")
@CrossOrigin(origins = "*")
public class TheaterRequisitionController {
    
    @Autowired
    private TheaterRequisitionService requisitionService;
    
    // Create new requisition
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TheaterRequisitionDto> createRequisition(@RequestBody CreateTheaterRequisitionRequest request) {
        TheaterRequisitionDto requisition = requisitionService.createRequisition(request);
        return ResponseEntity.ok(requisition);
    }
    
    // Submit requisition for approval
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TheaterRequisitionDto> submitRequisition(@PathVariable Long id) {
        TheaterRequisitionDto requisition = requisitionService.submitRequisition(id);
        return ResponseEntity.ok(requisition);
    }
    
    // Approve or reject requisition
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TheaterRequisitionDto> approveRequisition(
            @PathVariable Long id, 
            @RequestBody ApproveTheaterRequisitionRequest request) {
        TheaterRequisitionDto requisition = requisitionService.approveRequisition(id, request);
        return ResponseEntity.ok(requisition);
    }
    
    // Get all requisitions
    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<TheaterRequisitionDto>> getAllRequisitions(Pageable pageable) {
        Page<TheaterRequisitionDto> requisitions = requisitionService.getAllRequisitions(pageable);
        return ResponseEntity.ok(requisitions);
    }
    
    // Get requisitions by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterRequisitionDto>> getRequisitionsByStatus(@PathVariable String status) {
        List<TheaterRequisitionDto> requisitions = requisitionService.getRequisitionsByStatus(status);
        return ResponseEntity.ok(requisitions);
    }
    
    // Get pending approvals
    @GetMapping("/pending-approvals")
    @PreAuthorize("hasAnyRole('ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TheaterRequisitionDto>> getPendingApprovals() {
        List<TheaterRequisitionDto> requisitions = requisitionService.getPendingApprovals();
        return ResponseEntity.ok(requisitions);
    }
    
    // Get requisition by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TheaterRequisitionDto> getRequisitionById(@PathVariable Long id) {
        TheaterRequisitionDto requisition = requisitionService.getRequisitionById(id);
        return ResponseEntity.ok(requisition);
    }

    // Update requisition (only for DRAFT status)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TheaterRequisitionDto> updateRequisition(
            @PathVariable Long id,
            @RequestBody CreateTheaterRequisitionRequest request) {
        TheaterRequisitionDto requisition = requisitionService.updateRequisition(id, request);
        return ResponseEntity.ok(requisition);
    }

    // Delete requisition (only for DRAFT status)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteRequisition(@PathVariable Long id) {
        requisitionService.deleteRequisition(id);
        return ResponseEntity.noContent().build();
    }
}

