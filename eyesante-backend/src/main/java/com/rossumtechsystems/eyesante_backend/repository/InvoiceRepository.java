package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    // Find all invoices ordered by date descending (latest first)
    Page<Invoice> findAllByOrderByInvoiceDateDesc(Pageable pageable);
    
    // Find by invoice number
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    // Find by patient
    Page<Invoice> findByPatientIdOrderByInvoiceDateDesc(Long patientId, Pageable pageable);
    
    // Find by user
    Page<Invoice> findByUserIdOrderByInvoiceDateDesc(Long userId, Pageable pageable);
    
    // Find by appointment
    Optional<Invoice> findByAppointmentId(Long appointmentId);
    
    // Find by status
    Page<Invoice> findByStatusOrderByInvoiceDateDesc(Invoice.InvoiceStatus status, Pageable pageable);
    
    // Find by payment status
    Page<Invoice> findByPaymentStatusOrderByInvoiceDateDesc(Invoice.PaymentStatus paymentStatus, Pageable pageable);
    
    // Find by date range
    Page<Invoice> findByInvoiceDateBetweenOrderByInvoiceDateDesc(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Find overdue invoices
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :today AND i.paymentStatus != 'PAID' ORDER BY i.dueDate ASC")
    List<Invoice> findOverdueInvoices(@Param("today") LocalDate today);

    // Find recent invoices for a patient with a given purpose within a time interval
    @Query("SELECT i FROM Invoice i WHERE i.patient.id = :patientId AND i.invoicePurpose = :purpose AND i.createdAt >= :since ORDER BY i.createdAt DESC")
    List<Invoice> findRecentInvoicesByPatientAndPurpose(@Param("patientId") Long patientId,
                                                        @Param("purpose") String purpose,
                                                        @Param("since") java.time.LocalDateTime since);
    
    // Find invoices by patient and date range
    Page<Invoice> findByPatientIdAndInvoiceDateBetweenOrderByInvoiceDateDesc(
            Long patientId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Find invoices by user and date range
    Page<Invoice> findByUserIdAndInvoiceDateBetweenOrderByInvoiceDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Find invoices by insurance provider
    Page<Invoice> findByInsuranceProviderOrderByInvoiceDateDesc(String insuranceProvider, Pageable pageable);
    
    // Find invoices with balance due
    @Query("SELECT i FROM Invoice i WHERE i.balanceDue > 0 ORDER BY i.balanceDue DESC")
    Page<Invoice> findInvoicesWithBalanceDue(Pageable pageable);
    
    // Calculate total revenue for a date range
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate AND i.paymentStatus = 'PAID'")
    BigDecimal calculateTotalRevenue(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Calculate outstanding balance for a date range
    @Query("SELECT SUM(i.balanceDue) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate AND i.paymentStatus != 'PAID'")
    BigDecimal calculateOutstandingBalance(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Count invoices by status
    long countByStatus(Invoice.InvoiceStatus status);
    
    // Count invoices by payment status
    long countByPaymentStatus(Invoice.PaymentStatus paymentStatus);
    
    // Count total invoices in date range
    long countByInvoiceDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Calculate total paid amount for a date range
    @Query("SELECT SUM(i.amountPaid) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate AND i.amountPaid IS NOT NULL")
    BigDecimal calculateTotalPaid(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Calculate total overdue amount for a date range
    @Query("SELECT SUM(i.balanceDue) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate AND i.dueDate < :today AND i.paymentStatus != 'PAID'")
    BigDecimal calculateTotalOverdue(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("today") LocalDate today);
    
    // Calculate average invoice amount for a date range
    @Query("SELECT AVG(i.totalAmount) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateAverageInvoiceAmount(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Payment method breakdown for a date range
    @Query("SELECT i.paymentMethod, SUM(i.totalAmount) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate AND i.paymentMethod IS NOT NULL GROUP BY i.paymentMethod")
    List<Object[]> getPaymentMethodBreakdown(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Status breakdown for a date range
    @Query("SELECT i.status, COUNT(i) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate GROUP BY i.status")
    List<Object[]> getStatusBreakdown(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Top doctors by revenue for a date range
    @Query("SELECT i.user.id, i.doctorName, COUNT(i), SUM(i.totalAmount) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate AND i.user IS NOT NULL GROUP BY i.user.id, i.doctorName ORDER BY SUM(i.totalAmount) DESC")
    List<Object[]> getTopDoctors(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Top services by revenue for a date range
    @Query("SELECT ii.itemName, COUNT(DISTINCT i.id), SUM(ii.unitPrice * ii.quantity) FROM Invoice i JOIN i.invoiceItems ii WHERE i.invoiceDate BETWEEN :startDate AND :endDate GROUP BY ii.itemName ORDER BY SUM(ii.unitPrice * ii.quantity) DESC")
    List<Object[]> getTopServices(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Check if invoice number exists
    boolean existsByInvoiceNumber(String invoiceNumber);
} 