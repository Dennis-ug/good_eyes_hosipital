package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> {
    
    List<Diagnosis> findByCategoryIdOrderByNameAsc(Long categoryId);
    
    @Query("SELECT d FROM Diagnosis d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY d.name ASC")
    List<Diagnosis> searchByNameOrDescription(@Param("query") String query);
    
    @Query("SELECT d FROM Diagnosis d WHERE d.category.id = :categoryId AND (LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY d.name ASC")
    List<Diagnosis> searchByCategoryAndNameOrDescription(@Param("categoryId") Long categoryId, @Param("query") String query);
    
    boolean existsByNameAndCategoryId(String name, Long categoryId);
}
