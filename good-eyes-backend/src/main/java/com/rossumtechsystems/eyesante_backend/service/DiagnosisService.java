package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.*;
import com.rossumtechsystems.eyesante_backend.entity.Diagnosis;
import com.rossumtechsystems.eyesante_backend.entity.DiagnosisCategory;
import com.rossumtechsystems.eyesante_backend.entity.PatientDiagnosis;
import com.rossumtechsystems.eyesante_backend.repository.DiagnosisCategoryRepository;
import com.rossumtechsystems.eyesante_backend.repository.DiagnosisRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientDiagnosisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DiagnosisService {

    @Autowired
    private DiagnosisCategoryRepository categoryRepository;

    @Autowired
    private DiagnosisRepository diagnosisRepository;

    @Autowired
    private PatientDiagnosisRepository patientDiagnosisRepository;

    // Category Management
    public List<DiagnosisCategoryDto> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc()
            .stream()
            .map(this::convertToCategoryDto)
            .collect(Collectors.toList());
    }

    public DiagnosisCategoryDto createCategory(CreateDiagnosisCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category with name '" + request.getName() + "' already exists");
        }

        DiagnosisCategory category = new DiagnosisCategory();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        DiagnosisCategory saved = categoryRepository.save(category);
        return convertToCategoryDto(saved);
    }

    public DiagnosisCategoryDto getCategoryById(Long id) {
        Optional<DiagnosisCategory> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            return convertToCategoryDto(category.get());
        }
        throw new RuntimeException("Category not found with id: " + id);
    }

    public DiagnosisCategoryDto updateCategory(Long id, CreateDiagnosisCategoryRequest request) {
        Optional<DiagnosisCategory> optional = categoryRepository.findById(id);
        if (optional.isPresent()) {
            DiagnosisCategory category = optional.get();
            
            // Check if name is being changed and if it conflicts with existing
            if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
                throw new RuntimeException("Category with name '" + request.getName() + "' already exists");
            }
            
            category.setName(request.getName());
            category.setDescription(request.getDescription());

            DiagnosisCategory saved = categoryRepository.save(category);
            return convertToCategoryDto(saved);
        }
        throw new RuntimeException("Category not found with id: " + id);
    }

    public void deleteCategory(Long id) {
        // Check if category has diagnoses
        List<Diagnosis> diagnoses = diagnosisRepository.findByCategoryIdOrderByNameAsc(id);
        if (!diagnoses.isEmpty()) {
            throw new RuntimeException("Cannot delete category because it has " + diagnoses.size() + " diagnoses. Please delete or reassign diagnoses first.");
        }
        
        categoryRepository.deleteById(id);
    }

    // Diagnosis Management
    public Page<DiagnosisDto> getAllDiagnoses(Pageable pageable) {
        return diagnosisRepository.findAll(pageable)
            .map(this::convertToDiagnosisDto);
    }

    public List<DiagnosisDto> getDiagnosesByCategory(Long categoryId) {
        return diagnosisRepository.findByCategoryIdOrderByNameAsc(categoryId)
            .stream()
            .map(this::convertToDiagnosisDto)
            .collect(Collectors.toList());
    }

    public DiagnosisDto createDiagnosis(CreateDiagnosisRequest request) {
        // Verify category exists
        Optional<DiagnosisCategory> category = categoryRepository.findById(request.getCategoryId());
        if (!category.isPresent()) {
            throw new RuntimeException("Category not found with id: " + request.getCategoryId());
        }

        // Check for duplicate name in the same category
        if (diagnosisRepository.existsByNameAndCategoryId(request.getName(), request.getCategoryId())) {
            throw new RuntimeException("Diagnosis with name '" + request.getName() + "' already exists in this category");
        }

        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setName(request.getName());
        diagnosis.setDescription(request.getDescription());
        diagnosis.setCategory(category.get());

        Diagnosis saved = diagnosisRepository.save(diagnosis);
        return convertToDiagnosisDto(saved);
    }

    public DiagnosisDto getDiagnosisById(Long id) {
        Optional<Diagnosis> diagnosis = diagnosisRepository.findById(id);
        if (diagnosis.isPresent()) {
            return convertToDiagnosisDto(diagnosis.get());
        }
        throw new RuntimeException("Diagnosis not found with id: " + id);
    }

    public DiagnosisDto updateDiagnosis(Long id, CreateDiagnosisRequest request) {
        Optional<Diagnosis> optional = diagnosisRepository.findById(id);
        if (optional.isPresent()) {
            Diagnosis diagnosis = optional.get();

            // Verify category exists
            Optional<DiagnosisCategory> category = categoryRepository.findById(request.getCategoryId());
            if (!category.isPresent()) {
                throw new RuntimeException("Category not found with id: " + request.getCategoryId());
            }

            // Check for duplicate name in the same category (excluding current diagnosis)
            if (!diagnosis.getName().equals(request.getName()) || !diagnosis.getCategory().getId().equals(request.getCategoryId())) {
                if (diagnosisRepository.existsByNameAndCategoryId(request.getName(), request.getCategoryId())) {
                    throw new RuntimeException("Diagnosis with name '" + request.getName() + "' already exists in this category");
                }
            }

            diagnosis.setName(request.getName());
            diagnosis.setDescription(request.getDescription());
            diagnosis.setCategory(category.get());

            Diagnosis saved = diagnosisRepository.save(diagnosis);
            return convertToDiagnosisDto(saved);
        }
        throw new RuntimeException("Diagnosis not found with id: " + id);
    }

    public void deleteDiagnosis(Long id) {
        // Check if diagnosis exists
        Optional<Diagnosis> diagnosis = diagnosisRepository.findById(id);
        if (!diagnosis.isPresent()) {
            throw new RuntimeException("Diagnosis not found with id: " + id);
        }
        
        // Check if diagnosis has related patient diagnoses
        List<PatientDiagnosis> relatedPatientDiagnoses = patientDiagnosisRepository.findByDiagnosisId(id);
        if (!relatedPatientDiagnoses.isEmpty()) {
            throw new RuntimeException("Cannot delete this diagnosis because it has " + relatedPatientDiagnoses.size() + " related patient diagnoses. Please remove patient diagnoses first.");
        }
        
        diagnosisRepository.deleteById(id);
    }

    public List<DiagnosisDto> searchDiagnoses(String query) {
        return diagnosisRepository.searchByNameOrDescription(query)
            .stream()
            .map(this::convertToDiagnosisDto)
            .collect(Collectors.toList());
    }

    // Helper methods for conversion
    private DiagnosisCategoryDto convertToCategoryDto(DiagnosisCategory category) {
        DiagnosisCategoryDto dto = new DiagnosisCategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }

    private DiagnosisDto convertToDiagnosisDto(Diagnosis diagnosis) {
        DiagnosisDto dto = new DiagnosisDto();
        dto.setId(diagnosis.getId());
        dto.setName(diagnosis.getName());
        dto.setDescription(diagnosis.getDescription());
        dto.setCreatedAt(diagnosis.getCreatedAt());
        dto.setUpdatedAt(diagnosis.getUpdatedAt());
        
        if (diagnosis.getCategory() != null) {
            dto.setCategoryId(diagnosis.getCategory().getId());
            dto.setCategoryName(diagnosis.getCategory().getName());
        }
        
        return dto;
    }
}
