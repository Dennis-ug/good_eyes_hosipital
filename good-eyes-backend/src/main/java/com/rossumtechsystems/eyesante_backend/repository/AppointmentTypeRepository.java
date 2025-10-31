package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.AppointmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentTypeRepository extends JpaRepository<AppointmentType, Long> {
    
    // Find by name
    Optional<AppointmentType> findByName(String name);
    
    // Find active appointment types
    List<AppointmentType> findByIsActiveTrueOrderByName();
    
    // Find by active status
    List<AppointmentType> findByIsActiveOrderByName(Boolean isActive);
    
    // Check if name exists
    boolean existsByName(String name);
    
    // Find by name containing (for search)
    List<AppointmentType> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    // Find by requirements
    List<AppointmentType> findByRequiresInsuranceAndIsActiveTrue(Boolean requiresInsurance);
    
    List<AppointmentType> findByRequiresPrepaymentAndIsActiveTrue(Boolean requiresPrepayment);
    
    List<AppointmentType> findByRequiresConsultationAndIsActiveTrue(Boolean requiresConsultation);
} 