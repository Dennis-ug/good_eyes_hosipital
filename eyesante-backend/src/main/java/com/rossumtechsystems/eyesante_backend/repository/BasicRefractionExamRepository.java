package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.BasicRefractionExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BasicRefractionExamRepository extends JpaRepository<BasicRefractionExam, Long> {
    
    /**
     * Find basic refraction exam by visit session ID with patient details
     */
    @Query("SELECT b FROM BasicRefractionExam b " +
           "LEFT JOIN FETCH b.visitSession vs " +
           "LEFT JOIN FETCH vs.patient p " +
           "WHERE vs.id = :visitSessionId")
    Optional<BasicRefractionExam> findByVisitSessionIdWithPatient(@Param("visitSessionId") Long visitSessionId);
    
    /**
     * Find basic refraction exam by visit session ID (legacy method)
     */
    Optional<BasicRefractionExam> findByVisitSessionId(Long visitSessionId);
    
    /**
     * Find all basic refraction exams with patient details
     */
    @Query("SELECT b FROM BasicRefractionExam b " +
           "LEFT JOIN FETCH b.visitSession vs " +
           "LEFT JOIN FETCH vs.patient p")
    List<BasicRefractionExam> findAllWithPatientDetails();
    
    /**
     * Find basic refraction exam by ID with patient details
     */
    @Query("SELECT b FROM BasicRefractionExam b " +
           "LEFT JOIN FETCH b.visitSession vs " +
           "LEFT JOIN FETCH vs.patient p " +
           "WHERE b.id = :id")
    Optional<BasicRefractionExam> findByIdWithPatient(@Param("id") Long id);
}
