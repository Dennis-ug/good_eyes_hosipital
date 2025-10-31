package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.PatientProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientProcedureRepository extends JpaRepository<PatientProcedure, Long> {
    
    List<PatientProcedure> findByVisitSessionId(Long visitSessionId);

    List<PatientProcedure> findByVisitSessionIdAndPerformedTrue(Long visitSessionId);

    List<PatientProcedure> findByVisitSessionIdAndPerformedFalse(Long visitSessionId);

    List<PatientProcedure> findByPerformedFalse();
}
