package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.CreateInvoiceRequest;
import com.rossumtechsystems.eyesante_backend.dto.InvoiceDto;
import com.rossumtechsystems.eyesante_backend.entity.Invoice;
import com.rossumtechsystems.eyesante_backend.service.FinanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    // Generate invoice for appointment
    @PostMapping("/invoices/generate/{appointmentId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> generateInvoiceForAppointment(@PathVariable Long appointmentId) {
        InvoiceDto invoice = financeService.generateInvoiceForAppointment(appointmentId);
        return ResponseEntity.ok(invoice);
    }

    // Create invoice with patient and invoice items
    @PostMapping("/invoices/create")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> createInvoiceWithItems(@Valid @RequestBody CreateInvoiceRequest request) {
        // Get the authenticated user's username
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();
        
        InvoiceDto invoice = financeService.createInvoiceWithItems(request, authenticatedUsername);
        return ResponseEntity.ok(invoice);
    }

    // Get invoice by ID
    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable Long id) {
        InvoiceDto invoice = financeService.getInvoiceById(id);
        return ResponseEntity.ok(invoice);
    }

    // Get invoice by invoice number
    @GetMapping("/invoices/number/{invoiceNumber}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        InvoiceDto invoice = financeService.getInvoiceByNumber(invoiceNumber);
        return ResponseEntity.ok(invoice);
    }

    // Get all invoices (paginated)
    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InvoiceDto>> getAllInvoices(Pageable pageable) {
        Page<InvoiceDto> invoices = financeService.getAllInvoices(pageable);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by patient
    @GetMapping("/invoices/patient/{patientId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InvoiceDto>> getInvoicesByPatient(
            @PathVariable Long patientId, 
            Pageable pageable) {
        Page<InvoiceDto> invoices = financeService.getInvoicesByPatient(patientId, pageable);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by user
    @GetMapping("/invoices/user/{userId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InvoiceDto>> getInvoicesByUser(
            @PathVariable Long userId, 
            Pageable pageable) {
        Page<InvoiceDto> invoices = financeService.getInvoicesByUser(userId, pageable);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by status
    @GetMapping("/invoices/status/{status}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InvoiceDto>> getInvoicesByStatus(
            @PathVariable Invoice.InvoiceStatus status, 
            Pageable pageable) {
        Page<InvoiceDto> invoices = financeService.getInvoicesByStatus(status, pageable);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by payment status
    @GetMapping("/invoices/payment-status/{paymentStatus}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InvoiceDto>> getInvoicesByPaymentStatus(
            @PathVariable Invoice.PaymentStatus paymentStatus, 
            Pageable pageable) {
        Page<InvoiceDto> invoices = financeService.getInvoicesByPaymentStatus(paymentStatus, pageable);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by date range
    @GetMapping("/invoices/date-range")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InvoiceDto>> getInvoicesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<InvoiceDto> invoices = financeService.getInvoicesByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(invoices);
    }

    // Get overdue invoices
    @GetMapping("/invoices/overdue")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InvoiceDto>> getOverdueInvoices() {
        List<InvoiceDto> invoices = financeService.getOverdueInvoices();
        return ResponseEntity.ok(invoices);
    }

    // Get invoices with balance due
    @GetMapping("/invoices/balance-due")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Page<InvoiceDto>> getInvoicesWithBalanceDue(Pageable pageable) {
        Page<InvoiceDto> invoices = financeService.getInvoicesWithBalanceDue(pageable);
        return ResponseEntity.ok(invoices);
    }

    // Record payment for invoice
    @PostMapping("/invoices/{id}/payment")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> recordPayment(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @RequestParam Invoice.PaymentMethod method,
            @RequestParam(required = false) String reference) {
        InvoiceDto invoice = financeService.recordPayment(id, amount, method, reference);
        return ResponseEntity.ok(invoice);
    }

    // Update invoice status
    @PutMapping("/invoices/{id}/status")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceDto> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestParam Invoice.InvoiceStatus status) {
        InvoiceDto invoice = financeService.updateInvoiceStatus(id, status);
        return ResponseEntity.ok(invoice);
    }

    // Delete invoice - only SUPER_ADMIN
    @DeleteMapping("/invoices/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        financeService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    // Get financial summary
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'ACCOUNTANT', 'ACCOUNT_STORE_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<FinanceService.FinancialSummaryDto> getFinancialSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        FinanceService.FinancialSummaryDto summary = financeService.getFinancialSummary(startDate, endDate);
        return ResponseEntity.ok(summary);
    }
} 