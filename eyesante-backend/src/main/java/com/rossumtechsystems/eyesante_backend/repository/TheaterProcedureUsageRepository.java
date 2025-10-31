package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.TheaterProcedureUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TheaterProcedureUsageRepository extends JpaRepository<TheaterProcedureUsage, Long> {
    
    List<TheaterProcedureUsage> findByPatientProcedureIdOrderByUsageDateDesc(Long patientProcedureId);
    
    List<TheaterProcedureUsage> findByConsumableItemIdOrderByUsageDateDesc(Long consumableItemId);
    
    List<TheaterProcedureUsage> findByUsedByIdOrderByUsageDateDesc(Long userId);
    
    @Query("SELECT tpu FROM TheaterProcedureUsage tpu WHERE tpu.usageDate BETWEEN :startDate AND :endDate ORDER BY tpu.usageDate DESC")
    List<TheaterProcedureUsage> findByUsageDateBetweenOrderByUsageDateDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT tpu FROM TheaterProcedureUsage tpu WHERE tpu.theaterStore.id = :storeId ORDER BY tpu.usageDate DESC")
    List<TheaterProcedureUsage> findByTheaterStoreIdOrderByUsageDateDesc(Long storeId);
    
    @Query("SELECT tpu FROM TheaterProcedureUsage tpu WHERE tpu.patientProcedure.id = :procedureId AND tpu.consumableItem.id = :consumableId")
    List<TheaterProcedureUsage> findByPatientProcedureIdAndConsumableItemId(Long procedureId, Long consumableId);
}













