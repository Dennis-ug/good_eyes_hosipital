package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.DiagnosisCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiagnosisCategoryRepository extends JpaRepository<DiagnosisCategory, Long> {
    
    List<DiagnosisCategory> findAllByOrderByNameAsc();
    
    Optional<DiagnosisCategory> findByName(String name);
    
    boolean existsByName(String name);
}
