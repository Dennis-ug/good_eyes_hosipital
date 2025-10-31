package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.ConsumableCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConsumableCategoryRepository extends JpaRepository<ConsumableCategory, Long> {
    
    List<ConsumableCategory> findByIsActiveTrue();
    
    List<ConsumableCategory> findByDepartmentIdAndIsActiveTrue(Long departmentId);
    
    @Query("SELECT c FROM ConsumableCategory c WHERE c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%")
    List<ConsumableCategory> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
    
    boolean existsByNameAndDepartmentId(String name, Long departmentId);
}
