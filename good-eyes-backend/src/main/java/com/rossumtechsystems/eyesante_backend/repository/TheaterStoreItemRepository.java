package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.TheaterStoreItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TheaterStoreItemRepository extends JpaRepository<TheaterStoreItem, Long> {
    
    List<TheaterStoreItem> findByTheaterStoreIdAndIsActiveTrue(Long theaterStoreId);
    
    List<TheaterStoreItem> findByConsumableItemIdAndIsActiveTrue(Long consumableItemId);
    
    Optional<TheaterStoreItem> findByTheaterStoreIdAndConsumableItemIdAndBatchNumberAndIsActiveTrue(
        Long theaterStoreId, Long consumableItemId, String batchNumber);
    
    @Query("SELECT tsi FROM TheaterStoreItem tsi WHERE tsi.theaterStore.id = :theaterStoreId AND tsi.consumableItem.id = :consumableItemId AND tsi.isActive = true")
    List<TheaterStoreItem> findByTheaterStoreAndConsumableItem(Long theaterStoreId, Long consumableItemId);
    
    @Query("SELECT SUM(tsi.quantityAvailable) FROM TheaterStoreItem tsi WHERE tsi.theaterStore.id = :theaterStoreId AND tsi.consumableItem.id = :consumableItemId AND tsi.isActive = true")
    java.math.BigDecimal getTotalQuantityAvailable(Long theaterStoreId, Long consumableItemId);
    
    List<TheaterStoreItem> findByIsActiveTrue();
}
