package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.PatientDiagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientDiagnosisRepository extends JpaRepository<PatientDiagnosis, Long> {
    
    List<PatientDiagnosis> findByVisitSessionId(Long visitSessionId);
    
    @Query("SELECT pd FROM PatientDiagnosis pd WHERE pd.visitSession.id = :visitSessionId ORDER BY pd.diagnosisDate DESC")
    List<PatientDiagnosis> findByVisitSessionIdOrderByDiagnosisDateDesc(@Param("visitSessionId") Long visitSessionId);
    
    @Query("SELECT pd FROM PatientDiagnosis pd WHERE pd.visitSession.patient.id = :patientId ORDER BY pd.diagnosisDate DESC")
    List<PatientDiagnosis> findByPatientIdOrderByDiagnosisDateDesc(@Param("patientId") Long patientId);
    
    List<PatientDiagnosis> findByDiagnosisId(Long diagnosisId);
    
    @Query("SELECT pd FROM PatientDiagnosis pd WHERE pd.isPrimaryDiagnosis = true AND pd.visitSession.id = :visitSessionId")
    List<PatientDiagnosis> findPrimaryDiagnosesByVisitSessionId(@Param("visitSessionId") Long visitSessionId);
    
    @Query("SELECT pd FROM PatientDiagnosis pd WHERE pd.isConfirmed = true AND pd.visitSession.id = :visitSessionId")
    List<PatientDiagnosis> findConfirmedDiagnosesByVisitSessionId(@Param("visitSessionId") Long visitSessionId);
}
