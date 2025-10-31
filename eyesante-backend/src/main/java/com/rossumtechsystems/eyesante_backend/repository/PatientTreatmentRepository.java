package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.PatientTreatment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientTreatmentRepository extends JpaRepository<PatientTreatment, Long> {
    List<PatientTreatment> findByVisitSessionId(Long visitSessionId);
    Optional<PatientTreatment> findByVisitSessionIdAndInventoryItemId(Long visitSessionId, Long inventoryItemId);
}


