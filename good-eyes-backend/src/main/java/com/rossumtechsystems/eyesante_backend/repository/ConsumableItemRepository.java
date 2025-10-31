package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.ConsumableItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ConsumableItemRepository extends JpaRepository<ConsumableItem, Long> {
    
    List<ConsumableItem> findByIsActiveTrue();
    
    Page<ConsumableItem> findByIsActiveTrue(Pageable pageable);
    
    List<ConsumableItem> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    List<ConsumableItem> findByCurrentStockLessThanEqualAndIsActiveTrue(BigDecimal reorderPoint);
    
    List<ConsumableItem> findByExpiryDateBeforeAndIsActiveTrue(LocalDate date);
    
    @Query("SELECT c FROM ConsumableItem c WHERE c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm% OR c.sku LIKE %:searchTerm%")
    List<ConsumableItem> searchByNameOrDescriptionOrSku(@Param("searchTerm") String searchTerm);
    
    boolean existsBySku(String sku);
    
    @Query("SELECT c FROM ConsumableItem c WHERE c.currentStock <= c.reorderPoint AND c.isActive = true")
    List<ConsumableItem> findLowStockItems();
    
    long countByIsActiveTrue();
}
