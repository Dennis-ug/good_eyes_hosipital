package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.entity.Invoice;
import com.rossumtechsystems.eyesante_backend.entity.InvoiceItem;
import com.rossumtechsystems.eyesante_backend.entity.Patient;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.InvoiceRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PatientVisitSessionRepository patientVisitSessionRepository;

    /**
     * Create an automatic invoice for a new consultation visit
     */
    public Invoice createConsultationInvoice(PatientVisitSession visitSession) {
        log.info("Creating consultation invoice for visit session ID: {}", visitSession.getId());
        
        Patient patient = visitSession.getPatient();
        
        // Get the currently logged-in user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            currentUser = (User) authentication.getPrincipal();
        }
        
        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now()); // Due immediately for consultations
        invoice.setPatient(patient);
        invoice.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        invoice.setPatientPhone(patient.getPhone());
        invoice.setPatientEmail(null); // Patient entity doesn't have email field
        
        // Set user information (currently logged-in user)
        invoice.setUser(currentUser);
        if (currentUser != null) {
            invoice.setDoctorName(currentUser.getFirstName() + " " + currentUser.getLastName());
            invoice.setDoctorSpecialty("Ophthalmology"); // Default specialty
        } else {
            invoice.setDoctorName("System Generated");
            invoice.setDoctorSpecialty("Ophthalmology");
        }
        
        // Set consultation fee
        BigDecimal consultationFee = visitSession.getConsultationFeeAmount() != null ? 
                visitSession.getConsultationFeeAmount() : new BigDecimal("50.00");
        
        invoice.setSubtotal(consultationFee);
        invoice.setTaxAmount(BigDecimal.ZERO);
        invoice.setDiscountAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(consultationFee);
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setBalanceDue(consultationFee);
        
        // Set status
        invoice.setStatus(Invoice.InvoiceStatus.PENDING);
        invoice.setPaymentStatus(Invoice.PaymentStatus.PENDING);
        
        // Create invoice item for consultation
        InvoiceItem consultationItem = new InvoiceItem();
        consultationItem.setInvoice(invoice);
        consultationItem.setItemName("Consultation Fee");
        consultationItem.setItemDescription("Eye consultation and examination");
        consultationItem.setItemType("CONSULTATION");
        consultationItem.setQuantity(1);
        consultationItem.setUnitPrice(consultationFee);
        consultationItem.setTotalPrice(consultationFee);
        consultationItem.setFinalPrice(consultationFee);
        
        List<InvoiceItem> items = new ArrayList<>();
        items.add(consultationItem);
        invoice.setInvoiceItems(items);
        
        // Save invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        log.info("Created consultation invoice with ID: {} for patient: {} by user: {}", 
                savedInvoice.getId(), patient.getFirstName() + " " + patient.getLastName(),
                currentUser != null ? currentUser.getUsername() : "System");
        
        return savedInvoice;
    }
    
    /**
     * Mark invoice as paid and update visit session
     */
    public void markInvoiceAsPaid(Invoice invoice, PatientVisitSession.PaymentMethod paymentMethod, String paymentReference) {
        log.info("Invoice {} marked as paid (status already set). Updating visit session only.", invoice.getId());
        // Do NOT add payment here. Payment is already recorded elsewhere (FinanceService.recordPayment).
        // Only update associated visit session if this is a consultation invoice
        updateVisitSessionForPaidInvoice(invoice, paymentMethod, paymentReference);
    }
    
    /**
     * Update visit session when its associated invoice is paid
     */
    private void updateVisitSessionForPaidInvoice(Invoice invoice, PatientVisitSession.PaymentMethod paymentMethod, String paymentReference) {
        try {
            // Find visit session associated with this invoice
            PatientVisitSession visitSession = patientVisitSessionRepository.findByInvoice(invoice)
                    .orElse(null);
            
            if (visitSession != null && visitSession.getVisitPurpose() == PatientVisitSession.VisitPurpose.NEW_CONSULTATION) {
                log.info("Updating visit session {} for paid consultation invoice", visitSession.getId());
                
                // Mark consultation fee as paid
                visitSession.setConsultationFeePaid(true);
                visitSession.setPaymentMethod(paymentMethod);
                visitSession.setPaymentReference(paymentReference);
                visitSession.setStatus(PatientVisitSession.VisitStatus.PAYMENT_COMPLETED);
                visitSession.setCurrentStage(PatientVisitSession.VisitStage.TRIAGE);
                
                patientVisitSessionRepository.save(visitSession);
                
                log.info("Visit session {} updated: consultation fee paid, progressed to triage stage", visitSession.getId());
            }
        } catch (Exception e) {
            log.error("Failed to update visit session for paid invoice {}", invoice.getId(), e);
            // Don't throw exception to avoid rolling back the invoice payment
        }
    }
    
    /**
     * Generate unique invoice number
     */
    private String generateInvoiceNumber() {
        // Simple implementation - in production, use a more robust approach
        return "INV-" + System.currentTimeMillis();
    }
} 