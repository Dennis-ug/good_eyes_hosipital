package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.SurgeryReportConsumable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurgeryReportConsumableRepository extends JpaRepository<SurgeryReportConsumable, Long> {
    List<SurgeryReportConsumable> findBySurgeryReportId(Long surgeryReportId);
    void deleteBySurgeryReportId(Long surgeryReportId);
}
