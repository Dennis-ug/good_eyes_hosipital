package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.*;
import com.rossumtechsystems.eyesante_backend.entity.*;
import com.rossumtechsystems.eyesante_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TheaterProcedureUsageService {
    
    @Autowired
    private TheaterProcedureUsageRepository usageRepository;
    
    @Autowired
    private PatientProcedureRepository patientProcedureRepository;
    
    @Autowired
    private ConsumableItemRepository consumableItemRepository;
    
    @Autowired
    private TheaterStoreRepository theaterStoreRepository;
    
    
    // Record usage during procedure
    public List<TheaterProcedureUsageDto> recordProcedureUsage(CreateTheaterProcedureUsageRequest request) {
        List<TheaterProcedureUsageDto> usageDtos = new java.util.ArrayList<>();
        User currentUser = getCurrentUser();
        
        // Validate patient procedure exists
        Optional<PatientProcedure> procedureOptional = patientProcedureRepository.findById(request.getPatientProcedureId());
        if (!procedureOptional.isPresent()) {
            throw new RuntimeException("Patient procedure not found");
        }
        
        PatientProcedure procedure = procedureOptional.get();
        
        for (CreateTheaterProcedureUsageRequest.TheaterProcedureUsageItem usageItem : request.getUsageItems()) {
            TheaterProcedureUsage usage = new TheaterProcedureUsage();
            usage.setPatientProcedure(procedure);
            usage.setUsedBy(currentUser);
            usage.setQuantityUsed(BigDecimal.valueOf(usageItem.getQuantityUsed()));
            usage.setBatchNumber(usageItem.getBatchNumber());
            usage.setPurpose(usageItem.getPurpose());
            usage.setNotes(usageItem.getNotes());
            
            // Set consumable item
            Optional<ConsumableItem> consumableOptional = consumableItemRepository.findById(usageItem.getConsumableItemId());
            if (consumableOptional.isPresent()) {
                usage.setConsumableItem(consumableOptional.get());
            } else {
                throw new RuntimeException("Consumable item not found: " + usageItem.getConsumableItemId());
            }
            
            // Set theater store if provided
            if (usageItem.getTheaterStoreId() != null) {
                Optional<TheaterStore> storeOptional = theaterStoreRepository.findById(usageItem.getTheaterStoreId());
                if (storeOptional.isPresent()) {
                    usage.setTheaterStore(storeOptional.get());
                }
            }
            
            TheaterProcedureUsage savedUsage = usageRepository.save(usage);
            usageDtos.add(TheaterProcedureUsageDto.fromEntity(savedUsage));
        }
        
        return usageDtos;
    }
    
    // Get usage by patient procedure
    public List<TheaterProcedureUsageDto> getUsageByProcedure(Long procedureId) {
        return usageRepository.findByPatientProcedureIdOrderByUsageDateDesc(procedureId)
            .stream()
            .map(TheaterProcedureUsageDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get usage by consumable item
    public List<TheaterProcedureUsageDto> getUsageByConsumableItem(Long consumableItemId) {
        return usageRepository.findByConsumableItemIdOrderByUsageDateDesc(consumableItemId)
            .stream()
            .map(TheaterProcedureUsageDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get usage by user
    public List<TheaterProcedureUsageDto> getUsageByUser(Long userId) {
        return usageRepository.findByUsedByIdOrderByUsageDateDesc(userId)
            .stream()
            .map(TheaterProcedureUsageDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get usage by date range
    public List<TheaterProcedureUsageDto> getUsageByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return usageRepository.findByUsageDateBetweenOrderByUsageDateDesc(startDate, endDate)
            .stream()
            .map(TheaterProcedureUsageDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get usage by theater store
    public List<TheaterProcedureUsageDto> getUsageByTheaterStore(Long storeId) {
        return usageRepository.findByTheaterStoreIdOrderByUsageDateDesc(storeId)
            .stream()
            .map(TheaterProcedureUsageDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get all usage records
    public List<TheaterProcedureUsageDto> getAllUsage() {
        return usageRepository.findAll()
            .stream()
            .map(TheaterProcedureUsageDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get current user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new RuntimeException("User not authenticated");
    }
}

