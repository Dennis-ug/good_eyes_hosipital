package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.EyeExamination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EyeExaminationRepository extends JpaRepository<EyeExamination, Long> {
    
    // Find all examinations for a specific patient with pagination
    Page<EyeExamination> findByPatientIdOrderByExaminationDateDesc(Long patientId, Pageable pageable);
    
    // Find the latest examination for a patient
    @Query("SELECT e FROM EyeExamination e WHERE e.patient.id = :patientId ORDER BY e.examinationDate DESC")
    List<EyeExamination> findLatestExaminationByPatientId(@Param("patientId") Long patientId);
    
    // Find examinations by examiner with pagination
    Page<EyeExamination> findByExaminerIdOrderByExaminationDateDesc(Long examinerId, Pageable pageable);
    
    // Find examinations within a date range with pagination
    Page<EyeExamination> findByExaminationDateBetweenOrderByExaminationDateDesc(
        LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Find examinations with specific diagnosis with pagination
    @Query("SELECT e FROM EyeExamination e WHERE LOWER(e.diagnosis) LIKE LOWER(CONCAT('%', :diagnosis, '%'))")
    Page<EyeExamination> findByDiagnosisContainingIgnoreCase(@Param("diagnosis") String diagnosis, Pageable pageable);
    
    // Find examinations by patient and date range with pagination
    @Query("SELECT e FROM EyeExamination e WHERE e.patient.id = :patientId AND e.examinationDate BETWEEN :startDate AND :endDate ORDER BY e.examinationDate DESC")
    Page<EyeExamination> findByPatientIdAndDateRange(
        @Param("patientId") Long patientId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate, 
        Pageable pageable);
} 