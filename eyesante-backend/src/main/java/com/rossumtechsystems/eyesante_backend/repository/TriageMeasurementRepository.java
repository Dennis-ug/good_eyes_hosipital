package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.TriageMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TriageMeasurementRepository extends JpaRepository<TriageMeasurement, Long> {
    
    /**
     * Find triage measurement by visit session ID with patient details
     */
    @Query("SELECT t FROM TriageMeasurement t " +
           "LEFT JOIN FETCH t.visitSession vs " +
           "LEFT JOIN FETCH vs.patient p " +
           "WHERE vs.id = :visitSessionId")
    Optional<TriageMeasurement> findByVisitSessionIdWithPatient(@Param("visitSessionId") Long visitSessionId);
    
    /**
     * Find triage measurement by visit session ID (legacy method)
     */
    Optional<TriageMeasurement> findByVisitSessionId(Long visitSessionId);
    
    /**
     * Find all triage measurements with patient details
     */
    @Query("SELECT t FROM TriageMeasurement t " +
           "LEFT JOIN FETCH t.visitSession vs " +
           "LEFT JOIN FETCH vs.patient p")
    List<TriageMeasurement> findAllWithPatientDetails();
    
    /**
     * Find triage measurement by ID with patient details
     */
    @Query("SELECT t FROM TriageMeasurement t " +
           "LEFT JOIN FETCH t.visitSession vs " +
           "LEFT JOIN FETCH vs.patient p " +
           "WHERE t.id = :id")
    Optional<TriageMeasurement> findByIdWithPatient(@Param("id") Long id);
} 