package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    boolean existsByPatientNumber(String patientNumber);
    
    Patient findByPatientNumber(String patientNumber);
    
    List<Patient> findByPatientNumberIsNull();
    
    // Find all patients ordered by creation date (latest first)
    List<Patient> findAllByOrderByCreatedAtDesc();
    
    // Find non-deleted patients ordered by creation date (latest first)
    List<Patient> findByDeletedFalseOrderByCreatedAtDesc();
    
    @org.springframework.data.jpa.repository.Query("SELECT p.patientNumber FROM Patient p WHERE p.patientNumber IS NOT NULL ORDER BY p.patientNumber DESC LIMIT 1")
    String findHighestPatientNumber();
    
    // Find patients with null reception timestamp or received by fields
    List<Patient> findByReceptionTimestampIsNullOrReceivedByIsNull();
    
    // Count related data to avoid lazy loading issues
    @Query("SELECT COUNT(pvs) FROM PatientVisitSession pvs WHERE pvs.patient.id = :patientId")
    long countVisitSessionsByPatientId(Long patientId);
    
    @Query("SELECT COUNT(ee) FROM EyeExamination ee WHERE ee.patient.id = :patientId")
    long countEyeExaminationsByPatientId(Long patientId);
    
    // Find all patients ordered by ID ascending
    List<Patient> findAllByOrderByIdAsc();
    
    // Find all non-deleted patients ordered by ID ascending
    List<Patient> findByDeletedFalseOrderByIdAsc();
    
    // Find non-deleted patients with pagination
    Page<Patient> findByDeletedFalse(Pageable pageable);
    
    // Find non-deleted patient by ID
    Optional<Patient> findByIdAndDeletedFalse(Long id);
    
    // Find non-deleted patient by patient number
    Optional<Patient> findByPatientNumberAndDeletedFalse(String patientNumber);
    
    // Check if non-deleted patient exists by patient number
    boolean existsByPatientNumberAndDeletedFalse(String patientNumber);
    
    // Find deleted patients with pagination
    Page<Patient> findByDeletedTrue(Pageable pageable);
    
    // Phone uniqueness checks for non-deleted patients
    boolean existsByPhoneAndDeletedFalse(String phone);
    boolean existsByAlternativePhoneAndDeletedFalse(String alternativePhone);
    
    // Find patients by phone (for updates - excluding current patient)
    Optional<Patient> findByPhoneAndDeletedFalseAndIdNot(String phone, Long id);
    Optional<Patient> findByAlternativePhoneAndDeletedFalseAndIdNot(String alternativePhone, Long id);
    
    // Search patients by multiple fields
    @Query("SELECT p FROM Patient p WHERE p.deleted = false AND " +
           "(LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.patientNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "p.phone LIKE CONCAT('%', :query, '%') OR " +
           "p.alternativePhone LIKE CONCAT('%', :query, '%') OR " +
           "p.nationalId LIKE CONCAT('%', :query, '%')) " +
           "ORDER BY p.firstName ASC, p.lastName ASC")
    Page<Patient> searchPatients(String query, Pageable pageable);
} 