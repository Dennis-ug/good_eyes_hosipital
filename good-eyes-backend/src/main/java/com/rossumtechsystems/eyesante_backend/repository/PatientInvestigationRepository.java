package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.PatientInvestigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PatientInvestigationRepository extends JpaRepository<PatientInvestigation, Long> {
    List<PatientInvestigation> findByVisitSessionId(Long visitSessionId);

    @Query("SELECT pi FROM PatientInvestigation pi WHERE pi.visitSession.id = :visitSessionId AND pi.billed = false")
    List<PatientInvestigation> findUnbilledByVisitSession(@Param("visitSessionId") Long visitSessionId);

    @Query("SELECT pi FROM PatientInvestigation pi WHERE pi.visitSession.id = :visitSessionId AND pi.billed = false AND DATE(pi.createdAt) = :today")
    List<PatientInvestigation> findUnbilledCreatedOnDate(@Param("visitSessionId") Long visitSessionId, @Param("today") LocalDate today);
}


