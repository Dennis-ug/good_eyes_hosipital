package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.ProcedureDto;
import com.rossumtechsystems.eyesante_backend.entity.Procedure;
import com.rossumtechsystems.eyesante_backend.repository.ProcedureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProcedureService {
    
    @Autowired
    private ProcedureRepository procedureRepository;
    
    public List<ProcedureDto> getAllActiveProcedures() {
        return procedureRepository.findByIsActiveTrue()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public List<ProcedureDto> getProceduresByCategory(String category) {
        return procedureRepository.findByCategoryAndIsActiveTrue(category)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public List<String> getAllCategories() {
        return procedureRepository.findAllActiveCategories();
    }
    
    public Optional<ProcedureDto> getProcedureById(Long id) {
        return procedureRepository.findById(id)
                .map(this::toDto);
    }
    
    public ProcedureDto createProcedure(ProcedureDto dto) {
        Procedure procedure = toEntity(dto);
        procedure.setId(null);
        return toDto(procedureRepository.save(procedure));
    }
    
    public ProcedureDto updateProcedure(Long id, ProcedureDto dto) {
        Procedure procedure = toEntity(dto);
        procedure.setId(id);
        return toDto(procedureRepository.save(procedure));
    }
    
    public void deleteProcedure(Long id) {
        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Procedure not found"));
        procedure.setIsActive(false);
        procedureRepository.save(procedure);
    }
    
    private ProcedureDto toDto(Procedure entity) {
        ProcedureDto dto = new ProcedureDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setCategory(entity.getCategory());
        dto.setPrice(entity.getPrice());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
    
    private Procedure toEntity(ProcedureDto dto) {
        Procedure entity = new Procedure();
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setPrice(dto.getPrice());
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return entity;
    }
}
