package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.TheaterStore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TheaterStoreRepository extends JpaRepository<TheaterStore, Long> {
    
    List<TheaterStore> findByIsActiveTrue();
    
    Page<TheaterStore> findByIsActiveTrue(Pageable pageable);
    
    List<TheaterStore> findByStoreTypeAndIsActiveTrue(String storeType);
    
    @Query("SELECT ts FROM TheaterStore ts WHERE ts.location LIKE %:location% AND ts.isActive = true")
    List<TheaterStore> findByLocationContainingAndIsActiveTrue(String location);
    
    @Query("SELECT ts FROM TheaterStore ts WHERE ts.managedBy.id = :userId AND ts.isActive = true")
    List<TheaterStore> findByManagedByUserIdAndIsActiveTrue(Long userId);
    
    @Query("SELECT ts FROM TheaterStore ts WHERE ts.name = :name AND ts.isActive = true")
    Optional<TheaterStore> findByNameAndIsActiveTrue(String name);
}

