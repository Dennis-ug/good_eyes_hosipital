package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.*;
import com.rossumtechsystems.eyesante_backend.entity.*;
import com.rossumtechsystems.eyesante_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConsumablesService {
    
    @Autowired
    private ConsumableCategoryRepository categoryRepository;
    
    @Autowired
    private ConsumableItemRepository itemRepository;
    
    @Autowired
    private ConsumableUsageRepository usageRepository;
    
    @Autowired
    private ConsumableRestockRepository restockRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    
    // Category Management
    public Page<ConsumableCategoryDto> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable)
            .map(this::convertToCategoryDto);
    }
    
    public ConsumableCategoryDto createCategory(CreateConsumableCategoryRequest request) {
        ConsumableCategory category = new ConsumableCategory();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        if (request.getDepartmentId() != null) {
            Optional<Department> department = departmentRepository.findById(request.getDepartmentId());
            department.ifPresent(category::setDepartment);
        }
        
        ConsumableCategory saved = categoryRepository.save(category);
        return convertToCategoryDto(saved);
    }
    
    public ConsumableCategoryDto getCategoryById(Long id) {
        Optional<ConsumableCategory> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            return convertToCategoryDto(category.get());
        }
        throw new RuntimeException("Category not found with id: " + id);
    }
    
    public ConsumableCategoryDto updateCategory(Long id, CreateConsumableCategoryRequest request) {
        Optional<ConsumableCategory> optional = categoryRepository.findById(id);
        if (optional.isPresent()) {
            ConsumableCategory category = optional.get();
            category.setName(request.getName());
            category.setDescription(request.getDescription());
            category.setIsActive(request.getIsActive());
            
            if (request.getDepartmentId() != null) {
                Optional<Department> department = departmentRepository.findById(request.getDepartmentId());
                department.ifPresent(category::setDepartment);
            }
            
            ConsumableCategory saved = categoryRepository.save(category);
            return convertToCategoryDto(saved);
        }
        throw new RuntimeException("Category not found");
    }
    
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
    
    // Item Management
    public Page<ConsumableItemDto> getAllItems(Pageable pageable) {
        return itemRepository.findByIsActiveTrue(pageable)
            .map(this::convertToItemDto);
    }
    
    public Page<ConsumableItemDto> getAllItemsIncludingInactive(Pageable pageable) {
        return itemRepository.findAll(pageable)
            .map(this::convertToItemDto);
    }
    
    public ConsumableItemDto createItem(CreateConsumableItemRequest request) {
        ConsumableItem item = new ConsumableItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setSku(request.getSku());
        item.setUnitOfMeasure(request.getUnitOfMeasure());
        item.setCurrentStock(request.getCurrentStock() != null ? request.getCurrentStock() : BigDecimal.ZERO);
        item.setMinimumStockLevel(request.getMinimumStockLevel());
        item.setMaximumStockLevel(request.getMaximumStockLevel());
        item.setReorderPoint(request.getReorderPoint());
        item.setReorderQuantity(request.getReorderQuantity());
        item.setSupplierName(request.getSupplierName());
        item.setSupplierContact(request.getSupplierContact());
        item.setCostPerUnit(request.getCostPerUnit());
        item.setLocation(request.getLocation());
        item.setStore(request.getStore() != null ? request.getStore() : "General Store");
        item.setExpiryDate(request.getExpiryDate());
        item.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        if (request.getCategoryId() != null) {
            Optional<ConsumableCategory> category = categoryRepository.findById(request.getCategoryId());
            category.ifPresent(item::setCategory);
        }
        
        ConsumableItem saved = itemRepository.save(item);
        return convertToItemDto(saved);
    }
    
    public ConsumableItemDto getItemById(Long id) {
        Optional<ConsumableItem> item = itemRepository.findById(id);
        if (item.isPresent()) {
            return convertToItemDto(item.get());
        }
        throw new RuntimeException("Item not found with id: " + id);
    }
    
    public ConsumableItemDto updateStock(Long id, BigDecimal quantity) {
        Optional<ConsumableItem> optional = itemRepository.findById(id);
        if (optional.isPresent()) {
            ConsumableItem item = optional.get();
            item.setCurrentStock(quantity);
            ConsumableItem saved = itemRepository.save(item);
            return convertToItemDto(saved);
        }
        throw new RuntimeException("Item not found");
    }
    
    public ConsumableItemDto updateItem(Long id, CreateConsumableItemRequest request) {
        Optional<ConsumableItem> optional = itemRepository.findById(id);
        if (optional.isPresent()) {
            ConsumableItem item = optional.get();
            item.setName(request.getName());
            item.setDescription(request.getDescription());
            item.setSku(request.getSku());
            item.setUnitOfMeasure(request.getUnitOfMeasure());
            item.setMinimumStockLevel(request.getMinimumStockLevel());
            item.setMaximumStockLevel(request.getMaximumStockLevel());
            item.setReorderPoint(request.getReorderPoint());
            item.setReorderQuantity(request.getReorderQuantity());
            item.setSupplierName(request.getSupplierName());
            item.setSupplierContact(request.getSupplierContact());
            item.setCostPerUnit(request.getCostPerUnit());
            item.setLocation(request.getLocation());
            item.setStore(request.getStore() != null ? request.getStore() : "General Store");
            item.setExpiryDate(request.getExpiryDate());
            item.setIsActive(request.getIsActive());
            
            if (request.getCategoryId() != null) {
                Optional<ConsumableCategory> category = categoryRepository.findById(request.getCategoryId());
                category.ifPresent(item::setCategory);
            }
            
            ConsumableItem saved = itemRepository.save(item);
            return convertToItemDto(saved);
        }
        throw new RuntimeException("Item not found");
    }
    
    public void deleteItem(Long id) {
        Optional<ConsumableItem> itemOptional = itemRepository.findById(id);
        if (!itemOptional.isPresent()) {
            throw new RuntimeException("Item not found with id: " + id);
        }

        // Check for related usage records
        List<ConsumableUsage> usageRecords = usageRepository.findByConsumableItemIdOrderByUsageDateDesc(id);
        if (!usageRecords.isEmpty()) {
            throw new RuntimeException("Cannot delete item because it has " + usageRecords.size() + " usage records. Please delete usage records first or use soft delete.");
        }
        
        // Check for related restock records
        List<ConsumableRestock> restockRecords = restockRepository.findByConsumableItemIdOrderByRestockDateDesc(id);
        if (!restockRecords.isEmpty()) {
            throw new RuntimeException("Cannot delete item because it has " + restockRecords.size() + " restock records. Please delete restock records first or use soft delete.");
        }
        
        // If no related records, proceed with deletion
        itemRepository.deleteById(id);
    }
    
    public void softDeleteItem(Long id) {
        Optional<ConsumableItem> itemOptional = itemRepository.findById(id);
        if (!itemOptional.isPresent()) {
            throw new RuntimeException("Item not found with id: " + id);
        }
        
        ConsumableItem item = itemOptional.get();
        item.setIsActive(false);
        itemRepository.save(item);
    }
    
    // Usage Management
    public ConsumableUsageDto recordUsage(CreateConsumableUsageRequest request) {
        Optional<ConsumableItem> itemOptional = itemRepository.findById(request.getConsumableItemId());
        if (!itemOptional.isPresent()) {
            throw new RuntimeException("Consumable item not found");
        }
        
        ConsumableItem item = itemOptional.get();
        
        // Check if enough stock is available
        if (item.getCurrentStock().compareTo(request.getQuantityUsed()) < 0) {
            throw new RuntimeException("Insufficient stock available");
        }
        
        // Deduct stock
        BigDecimal newStock = item.getCurrentStock().subtract(request.getQuantityUsed());
        item.setCurrentStock(newStock);
        itemRepository.save(item);
        
        // Record usage
        ConsumableUsage usage = new ConsumableUsage();
        usage.setConsumableItem(item);
        usage.setQuantityUsed(request.getQuantityUsed());
        usage.setUsageDate(request.getUsageDate() != null ? request.getUsageDate() : LocalDateTime.now());
        usage.setPurpose(request.getPurpose());
        usage.setNotes(request.getNotes());
        
        // Set department
        if (request.getDepartmentId() != null) {
            Optional<Department> department = departmentRepository.findById(request.getDepartmentId());
            department.ifPresent(usage::setDepartment);
        }
        
        ConsumableUsage saved = usageRepository.save(usage);
        return convertToUsageDto(saved);
    }
    
    public Page<ConsumableUsageDto> getUsageHistory(Pageable pageable) {
        return usageRepository.findAll(pageable)
            .map(this::convertToUsageDto);
    }
    
    // Restock Management
    public ConsumableRestockDto recordRestock(CreateConsumableRestockRequest request) {
        Optional<ConsumableItem> itemOptional = itemRepository.findById(request.getConsumableItemId());
        if (!itemOptional.isPresent()) {
            throw new RuntimeException("Consumable item not found");
        }
        
        ConsumableItem item = itemOptional.get();
        
        // Add stock
        BigDecimal newStock = item.getCurrentStock().add(request.getQuantityAdded());
        item.setCurrentStock(newStock);
        
        // Update expiry date if provided
        if (request.getExpiryDate() != null) {
            item.setExpiryDate(request.getExpiryDate());
        }
        
        itemRepository.save(item);
        
        // Record restock
        ConsumableRestock restock = new ConsumableRestock();
        restock.setConsumableItem(item);
        restock.setQuantityAdded(request.getQuantityAdded());
        restock.setRestockDate(request.getRestockDate() != null ? request.getRestockDate() : LocalDateTime.now());
        restock.setSupplierName(request.getSupplierName());
        restock.setCostPerUnit(request.getCostPerUnit());
        restock.setTotalCost(request.getTotalCost());
        restock.setInvoiceNumber(request.getInvoiceNumber());
        restock.setExpiryDate(request.getExpiryDate());
        restock.setNotes(request.getNotes());
        
        ConsumableRestock saved = restockRepository.save(restock);
        return convertToRestockDto(saved);
    }
    
    // Reports
    public List<ConsumableItemDto> getLowStockItems() {
        return itemRepository.findLowStockItems()
            .stream()
            .map(this::convertToItemDto)
            .collect(Collectors.toList());
    }
    
    public BigDecimal getTotalStockValue() {
        return itemRepository.findByIsActiveTrue()
            .stream()
            .map(item -> item.getCurrentStock().multiply(item.getCostPerUnit() != null ? item.getCostPerUnit() : BigDecimal.ZERO))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public long getTotalItemsCount() {
        return itemRepository.countByIsActiveTrue();
    }
    
    // Helper methods for conversion
    private ConsumableCategoryDto convertToCategoryDto(ConsumableCategory category) {
        ConsumableCategoryDto dto = new ConsumableCategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        
        if (category.getDepartment() != null) {
            dto.setDepartmentId(category.getDepartment().getId());
            dto.setDepartmentName(category.getDepartment().getName());
        }
        
        return dto;
    }
    
    private ConsumableItemDto convertToItemDto(ConsumableItem item) {
        ConsumableItemDto dto = new ConsumableItemDto();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setSku(item.getSku());
        dto.setUnitOfMeasure(item.getUnitOfMeasure());
        dto.setCurrentStock(item.getCurrentStock());
        dto.setMinimumStockLevel(item.getMinimumStockLevel());
        dto.setMaximumStockLevel(item.getMaximumStockLevel());
        dto.setReorderPoint(item.getReorderPoint());
        dto.setReorderQuantity(item.getReorderQuantity());
        dto.setSupplierName(item.getSupplierName());
        dto.setSupplierContact(item.getSupplierContact());
        dto.setCostPerUnit(item.getCostPerUnit());
        dto.setLocation(item.getLocation());
        dto.setStore(item.getStore());
        dto.setExpiryDate(item.getExpiryDate());
        dto.setIsActive(item.getIsActive());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        
        if (item.getCategory() != null) {
            dto.setCategoryId(item.getCategory().getId());
            dto.setCategoryName(item.getCategory().getName());
        }
        
        return dto;
    }
    
    private ConsumableUsageDto convertToUsageDto(ConsumableUsage usage) {
        ConsumableUsageDto dto = new ConsumableUsageDto();
        dto.setId(usage.getId());
        dto.setQuantityUsed(usage.getQuantityUsed());
        dto.setUsageDate(usage.getUsageDate());
        dto.setPurpose(usage.getPurpose());
        dto.setNotes(usage.getNotes());
        dto.setCreatedAt(usage.getCreatedAt());
        
        if (usage.getConsumableItem() != null) {
            dto.setConsumableItemId(usage.getConsumableItem().getId());
            dto.setConsumableItemName(usage.getConsumableItem().getName());
        }
        
        if (usage.getUsedByUser() != null) {
            dto.setUsedByUserId(usage.getUsedByUser().getId());
            dto.setUsedByUserName(usage.getUsedByUser().getFirstName() + " " + usage.getUsedByUser().getLastName());
        }
        
        if (usage.getDepartment() != null) {
            dto.setDepartmentId(usage.getDepartment().getId());
            dto.setDepartmentName(usage.getDepartment().getName());
        }
        
        if (usage.getPatient() != null) {
            dto.setPatientId(usage.getPatient().getId());
            dto.setPatientName(usage.getPatient().getFirstName() + " " + usage.getPatient().getLastName());
        }
        
        if (usage.getVisitSession() != null) {
            dto.setVisitSessionId(usage.getVisitSession().getId());
        }
        
        return dto;
    }
    
    private ConsumableRestockDto convertToRestockDto(ConsumableRestock restock) {
        ConsumableRestockDto dto = new ConsumableRestockDto();
        dto.setId(restock.getId());
        dto.setQuantityAdded(restock.getQuantityAdded());
        dto.setRestockDate(restock.getRestockDate());
        dto.setSupplierName(restock.getSupplierName());
        dto.setCostPerUnit(restock.getCostPerUnit());
        dto.setTotalCost(restock.getTotalCost());
        dto.setInvoiceNumber(restock.getInvoiceNumber());
        dto.setExpiryDate(restock.getExpiryDate());
        dto.setNotes(restock.getNotes());
        dto.setCreatedAt(restock.getCreatedAt());
        
        if (restock.getConsumableItem() != null) {
            dto.setConsumableItemId(restock.getConsumableItem().getId());
            dto.setConsumableItemName(restock.getConsumableItem().getName());
        }
        
        if (restock.getRestockedByUser() != null) {
            dto.setRestockedByUserId(restock.getRestockedByUser().getId());
            dto.setRestockedByUserName(restock.getRestockedByUser().getFirstName() + " " + restock.getRestockedByUser().getLastName());
        }
        
        return dto;
    }

    // Search functionality for theater requisitions
    public List<ConsumableItemDto> searchConsumableItems(String searchTerm) {
        List<ConsumableItem> items = itemRepository.searchByNameOrDescriptionOrSku(searchTerm);
        return items.stream()
            .map(this::convertToItemDto)
            .collect(Collectors.toList());
    }

}
