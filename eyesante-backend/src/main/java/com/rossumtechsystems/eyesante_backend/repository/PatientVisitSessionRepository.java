package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface PatientVisitSessionRepository extends JpaRepository<PatientVisitSession, Long> {
    
    /**
     * Find visit sessions by patient ID
     */
    List<PatientVisitSession> findByPatientId(Long patientId);
    
    /**
     * Find visit sessions by status
     */
    List<PatientVisitSession> findByStatus(PatientVisitSession.VisitStatus status);
    
    /**
     * Find visit sessions by visit purpose
     */
    List<PatientVisitSession> findByVisitPurpose(PatientVisitSession.VisitPurpose visitPurpose);
    
    /**
     * Count visit sessions by status
     */
    long countByStatus(PatientVisitSession.VisitStatus status);
    
    /**
     * Find visit sessions by patient ID and status
     */
    List<PatientVisitSession> findByPatientIdAndStatus(Long patientId, PatientVisitSession.VisitStatus status);
    
    /**
     * Find visit sessions by visit date range
     */
    List<PatientVisitSession> findByVisitDateBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    
    /**
     * Find emergency visits
     */
    List<PatientVisitSession> findByIsEmergencyTrue();
    
    /**
     * Find visits requiring triage
     */
    List<PatientVisitSession> findByRequiresTriageTrue();
    
    /**
     * Find visits requiring doctor visit
     */
    List<PatientVisitSession> findByRequiresDoctorVisitTrue();
    
    /**
     * Find visit session by invoice
     */
    java.util.Optional<PatientVisitSession> findByInvoice(com.rossumtechsystems.eyesante_backend.entity.Invoice invoice);
    
    /**
     * Find all visit sessions with patient data eagerly loaded (non-paginated)
     */
    @Query("SELECT DISTINCT v FROM PatientVisitSession v LEFT JOIN FETCH v.patient LEFT JOIN FETCH v.invoice ORDER BY v.visitDate DESC")
    List<PatientVisitSession> findAllWithPatient();
    
    /**
     * Find all visit sessions with patient data eagerly loaded (paginated)
     */
    @Query("SELECT DISTINCT v FROM PatientVisitSession v LEFT JOIN FETCH v.patient LEFT JOIN FETCH v.invoice ORDER BY v.visitDate DESC")
    Page<PatientVisitSession> findAllWithPatient(Pageable pageable);
    
    /**
     * Find visit sessions by patient ID with patient data eagerly loaded
     */
    @Query("SELECT DISTINCT v FROM PatientVisitSession v LEFT JOIN FETCH v.patient LEFT JOIN FETCH v.invoice WHERE v.patient.id = :patientId ORDER BY v.visitDate DESC")
    List<PatientVisitSession> findByPatientIdWithPatient(Long patientId);

    /**
     * Find single visit session by ID with patient and invoice eagerly loaded
     */
    @Query("SELECT DISTINCT v FROM PatientVisitSession v LEFT JOIN FETCH v.patient LEFT JOIN FETCH v.invoice WHERE v.id = :id")
    java.util.Optional<PatientVisitSession> findByIdWithPatientAndInvoice(@Param("id") Long id);
    
    /**
     * Search visit sessions by patient name, patient number, or visit details
     */
    @Query("SELECT DISTINCT v FROM PatientVisitSession v LEFT JOIN FETCH v.patient LEFT JOIN FETCH v.invoice WHERE " +
           "(LOWER(v.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.patient.patientNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.chiefComplaint) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.notes) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY v.visitDate DESC")
    Page<PatientVisitSession> searchVisitSessions(@Param("search") String search, Pageable pageable);
} 