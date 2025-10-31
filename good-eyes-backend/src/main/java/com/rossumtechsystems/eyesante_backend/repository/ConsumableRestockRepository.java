package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.ConsumableRestock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsumableRestockRepository extends JpaRepository<ConsumableRestock, Long> {
    
    List<ConsumableRestock> findByConsumableItemIdOrderByRestockDateDesc(Long consumableItemId);
    
    List<ConsumableRestock> findByRestockedByUserIdOrderByRestockDateDesc(Long restockedByUserId);
    
    @Query("SELECT cr FROM ConsumableRestock cr WHERE cr.restockDate BETWEEN :startDate AND :endDate ORDER BY cr.restockDate DESC")
    List<ConsumableRestock> findByRestockDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT cr FROM ConsumableRestock cr WHERE cr.consumableItem.id = :itemId AND cr.restockDate BETWEEN :startDate AND :endDate ORDER BY cr.restockDate DESC")
    List<ConsumableRestock> findByItemIdAndRestockDateBetween(@Param("itemId") Long itemId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
