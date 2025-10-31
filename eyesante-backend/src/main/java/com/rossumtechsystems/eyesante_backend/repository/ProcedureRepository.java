package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.Procedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, Long> {
    
    List<Procedure> findByIsActiveTrue();
    
    List<Procedure> findByCategoryAndIsActiveTrue(String category);
    
    @Query("SELECT DISTINCT p.category FROM Procedure p WHERE p.isActive = true ORDER BY p.category")
    List<String> findAllActiveCategories();
}
