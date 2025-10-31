package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rossumtechsystems.eyesante_backend.entity.Invoice;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDto {
    private Long id;
    private String invoiceNumber;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate invoiceDate;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    
    // Patient Information
    private Long patientId;
    private String patientNumber;
    private String patientName;
    private String patientPhone;
    private String patientEmail;
    
    // Doctor Information
    private Long userId;
    private String doctorName;
    private String doctorSpecialty;
    
    // Appointment Reference
    private Long appointmentId;
    
    // Financial Information
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    
    // Status Information
    private Invoice.InvoiceStatus status;
    private Invoice.PaymentStatus paymentStatus;
    
    // Payment Information
    private Invoice.PaymentMethod paymentMethod;
    private String paymentReference;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paymentDate;
    
    // Insurance Information
    private String insuranceProvider;
    private String insuranceNumber;
    private BigDecimal insuranceCoverage;
    private BigDecimal insuranceAmount;
    
    // Notes
    private String notes;
    private String internalNotes;

    // Purpose (from Visit Session)
    private String invoicePurpose;
    
    // Invoice Items
    private List<InvoiceItemDto> invoiceItems;
    
    // Audit Information
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String updatedBy;
} 