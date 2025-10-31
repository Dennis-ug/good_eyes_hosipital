package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.TheaterStoreTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TheaterStoreTransferRepository extends JpaRepository<TheaterStoreTransfer, Long> {
    
    List<TheaterStoreTransfer> findByRequisitionId(Long requisitionId);
    
    List<TheaterStoreTransfer> findByStatus(TheaterStoreTransfer.TransferStatus status);
    
    @Query("SELECT tst FROM TheaterStoreTransfer tst WHERE tst.transferDate BETWEEN :startDate AND :endDate ORDER BY tst.transferDate DESC")
    List<TheaterStoreTransfer> findByTransferDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT tst FROM TheaterStoreTransfer tst WHERE tst.toTheaterStore.id = :storeId ORDER BY tst.transferDate DESC")
    List<TheaterStoreTransfer> findByToTheaterStoreId(Long storeId);
    
    @Query("SELECT tst FROM TheaterStoreTransfer tst WHERE tst.transferredBy.id = :userId ORDER BY tst.transferDate DESC")
    List<TheaterStoreTransfer> findByTransferredByUserId(Long userId);
}













