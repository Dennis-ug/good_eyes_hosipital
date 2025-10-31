package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.SurgeryReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurgeryReportRepository extends JpaRepository<SurgeryReport, Long> {
    List<SurgeryReport> findByPatientProcedureId(Long patientProcedureId);
}


