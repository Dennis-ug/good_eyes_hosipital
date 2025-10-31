package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.InventoryCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryCategoryRepository extends JpaRepository<InventoryCategory, Long> {
    
    Optional<InventoryCategory> findByName(String name);
    
    List<InventoryCategory> findByIsActiveTrue();
    
    Page<InventoryCategory> findByIsActiveTrue(Pageable pageable);
    
    @Query("SELECT c FROM InventoryCategory c WHERE c.isActive = true AND LOWER(c.name) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<InventoryCategory> findActiveByNameContainingIgnoreCase(String name);
    
    boolean existsByName(String name);
} 