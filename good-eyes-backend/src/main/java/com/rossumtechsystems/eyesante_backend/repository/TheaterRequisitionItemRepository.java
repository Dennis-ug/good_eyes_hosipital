package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.TheaterRequisitionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TheaterRequisitionItemRepository extends JpaRepository<TheaterRequisitionItem, Long> {
    
    List<TheaterRequisitionItem> findByRequisitionId(Long requisitionId);
    
    List<TheaterRequisitionItem> findByConsumableItemId(Long consumableItemId);
    
    @Query("SELECT tri FROM TheaterRequisitionItem tri WHERE tri.requisition.id = :requisitionId AND tri.quantityApproved > 0")
    List<TheaterRequisitionItem> findApprovedItemsByRequisitionId(Long requisitionId);
    
    @Query("SELECT tri FROM TheaterRequisitionItem tri WHERE tri.requisition.id = :requisitionId AND tri.quantityFulfilled < tri.quantityApproved")
    List<TheaterRequisitionItem> findUnfulfilledItemsByRequisitionId(Long requisitionId);
    
    @Query("SELECT tri FROM TheaterRequisitionItem tri WHERE tri.requisition.status = 'APPROVED' AND tri.quantityFulfilled < tri.quantityApproved")
    List<TheaterRequisitionItem> findPendingFulfillment();

    void deleteByRequisitionId(Long requisitionId);
}

