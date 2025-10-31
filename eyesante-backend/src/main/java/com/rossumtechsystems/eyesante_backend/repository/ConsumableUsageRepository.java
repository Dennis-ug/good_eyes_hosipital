package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.ConsumableUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsumableUsageRepository extends JpaRepository<ConsumableUsage, Long> {
    
    List<ConsumableUsage> findByConsumableItemIdOrderByUsageDateDesc(Long consumableItemId);
    
    List<ConsumableUsage> findByDepartmentIdOrderByUsageDateDesc(Long departmentId);
    
    List<ConsumableUsage> findByUsedByUserIdOrderByUsageDateDesc(Long usedByUserId);
    
    List<ConsumableUsage> findByPatientIdOrderByUsageDateDesc(Long patientId);
    
    List<ConsumableUsage> findByVisitSessionIdOrderByUsageDateDesc(Long visitSessionId);
    
    @Query("SELECT cu FROM ConsumableUsage cu WHERE cu.usageDate BETWEEN :startDate AND :endDate ORDER BY cu.usageDate DESC")
    List<ConsumableUsage> findByUsageDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT cu FROM ConsumableUsage cu WHERE cu.consumableItem.id = :itemId AND cu.usageDate BETWEEN :startDate AND :endDate ORDER BY cu.usageDate DESC")
    List<ConsumableUsage> findByItemIdAndUsageDateBetween(@Param("itemId") Long itemId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
