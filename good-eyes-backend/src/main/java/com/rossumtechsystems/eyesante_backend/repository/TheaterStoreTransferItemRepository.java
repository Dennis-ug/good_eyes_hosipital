package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.TheaterStoreTransferItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TheaterStoreTransferItemRepository extends JpaRepository<TheaterStoreTransferItem, Long> {
    
    List<TheaterStoreTransferItem> findByTransferId(Long transferId);
    
    List<TheaterStoreTransferItem> findByConsumableItemId(Long consumableItemId);
}













