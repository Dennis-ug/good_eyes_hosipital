package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreateInventoryCategoryRequest;
import com.rossumtechsystems.eyesante_backend.dto.InventoryCategoryDto;
import com.rossumtechsystems.eyesante_backend.entity.InventoryCategory;
import com.rossumtechsystems.eyesante_backend.repository.InventoryCategoryRepository;
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
public class InventoryCategoryService {

    @Autowired
    private InventoryCategoryRepository inventoryCategoryRepository;

    /**
     * Create a new inventory category
     */
    public InventoryCategoryDto createCategory(CreateInventoryCategoryRequest request) {
        // Check if category with same name already exists
        if (inventoryCategoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category with name '" + request.getName() + "' already exists");
        }

        InventoryCategory category = new InventoryCategory();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIsActive(true);

        InventoryCategory savedCategory = inventoryCategoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    /**
     * Get category by ID
     */
    public InventoryCategoryDto getCategoryById(Long id) {
        InventoryCategory category = inventoryCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        return convertToDto(category);
    }

    /**
     * Get category by name
     */
    public InventoryCategoryDto getCategoryByName(String name) {
        InventoryCategory category = inventoryCategoryRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Category not found with name: " + name));
        return convertToDto(category);
    }

    /**
     * Get all active categories
     */
    public List<InventoryCategoryDto> getAllActiveCategories() {
        return inventoryCategoryRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all categories with pagination
     */
    public Page<InventoryCategoryDto> getAllCategories(Pageable pageable) {
        return inventoryCategoryRepository.findByIsActiveTrue(pageable)
                .map(this::convertToDto);
    }

    /**
     * Search categories by name
     */
    public List<InventoryCategoryDto> searchCategoriesByName(String name) {
        return inventoryCategoryRepository.findActiveByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update category
     */
    public InventoryCategoryDto updateCategory(Long id, CreateInventoryCategoryRequest request) {
        InventoryCategory category = inventoryCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

        // Check if new name conflicts with existing category
        Optional<InventoryCategory> existingCategory = inventoryCategoryRepository.findByName(request.getName());
        if (existingCategory.isPresent() && !existingCategory.get().getId().equals(id)) {
            throw new RuntimeException("Category with name '" + request.getName() + "' already exists");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        InventoryCategory savedCategory = inventoryCategoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    /**
     * Delete category (soft delete)
     */
    public void deleteCategory(Long id) {
        InventoryCategory category = inventoryCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

        category.setIsActive(false);
        inventoryCategoryRepository.save(category);
    }

    /**
     * Convert entity to DTO
     */
    private InventoryCategoryDto convertToDto(InventoryCategory category) {
        InventoryCategoryDto dto = new InventoryCategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setCreatedBy(category.getCreatedBy());
        dto.setUpdatedBy(category.getUpdatedBy());
        return dto;
    }
} 