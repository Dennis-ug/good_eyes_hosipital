package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreateTheaterStoreRequest;
import com.rossumtechsystems.eyesante_backend.dto.TheaterStoreDto;
import com.rossumtechsystems.eyesante_backend.dto.TheaterStoreItemDto;
import com.rossumtechsystems.eyesante_backend.entity.TheaterStore;
import com.rossumtechsystems.eyesante_backend.entity.TheaterStoreItem;
import com.rossumtechsystems.eyesante_backend.entity.ConsumableItem;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.TheaterStoreRepository;
import com.rossumtechsystems.eyesante_backend.repository.TheaterStoreItemRepository;
import com.rossumtechsystems.eyesante_backend.repository.ConsumableItemRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TheaterStoreService {
    
    private final TheaterStoreRepository theaterStoreRepository;
    private final TheaterStoreItemRepository theaterStoreItemRepository;
    private final ConsumableItemRepository consumableItemRepository;
    private final UserRepository userRepository;
    
    // Create a new theater store
    public TheaterStoreDto createTheaterStore(CreateTheaterStoreRequest request) {
        log.info("Creating new theater store: {}", request.getName());
        
        TheaterStore theaterStore = new TheaterStore();
        theaterStore.setName(request.getName());
        theaterStore.setDescription(request.getDescription());
        theaterStore.setLocation(request.getLocation());
        theaterStore.setStoreType(request.getStoreType());
        theaterStore.setCapacity(request.getCapacity());
        theaterStore.setIsActive(request.getIsActive());
        
        // Set manager if provided
        if (request.getManagedByUserId() != null) {
            User manager = userRepository.findById(request.getManagedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getManagedByUserId()));
            theaterStore.setManagedBy(manager);
        }
        
        TheaterStore saved = theaterStoreRepository.save(theaterStore);
        log.info("Theater store created successfully with ID: {}", saved.getId());
        
        return TheaterStoreDto.fromEntity(saved);
    }
    
    // Get all theater stores with pagination
    @Transactional(readOnly = true)
    public Page<TheaterStoreDto> getAllTheaterStores(Pageable pageable) {
        log.info("Fetching theater stores with pagination: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        
        return theaterStoreRepository.findAll(pageable)
            .map(TheaterStoreDto::fromEntity);
    }
    
    // Get all active theater stores
    @Transactional(readOnly = true)
    public List<TheaterStoreDto> getAllActiveTheaterStores() {
        log.info("Fetching all active theater stores");
        
        return theaterStoreRepository.findByIsActiveTrue()
            .stream()
            .map(TheaterStoreDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get theater store by ID
    @Transactional(readOnly = true)
    public TheaterStoreDto getTheaterStoreById(Long id) {
        log.info("Fetching theater store by ID: {}", id);
        
        TheaterStore theaterStore = theaterStoreRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Theater store not found with ID: " + id));
        
        return TheaterStoreDto.fromEntity(theaterStore);
    }
    
    // Update theater store
    public TheaterStoreDto updateTheaterStore(Long id, CreateTheaterStoreRequest request) {
        log.info("Updating theater store with ID: {}", id);
        
        TheaterStore theaterStore = theaterStoreRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Theater store not found with ID: " + id));
        
        theaterStore.setName(request.getName());
        theaterStore.setDescription(request.getDescription());
        theaterStore.setLocation(request.getLocation());
        theaterStore.setStoreType(request.getStoreType());
        theaterStore.setCapacity(request.getCapacity());
        theaterStore.setIsActive(request.getIsActive());
        
        // Update manager if provided
        if (request.getManagedByUserId() != null) {
            User manager = userRepository.findById(request.getManagedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getManagedByUserId()));
            theaterStore.setManagedBy(manager);
        } else {
            theaterStore.setManagedBy(null);
        }
        
        TheaterStore saved = theaterStoreRepository.save(theaterStore);
        log.info("Theater store updated successfully with ID: {}", saved.getId());
        
        return TheaterStoreDto.fromEntity(saved);
    }
    
    // Delete theater store (soft delete by setting isActive to false)
    public void deleteTheaterStore(Long id) {
        log.info("Deleting theater store with ID: {}", id);
        
        TheaterStore theaterStore = theaterStoreRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Theater store not found with ID: " + id));
        
        // Return quantities from theater store items back to main inventory
        returnQuantitiesToMainInventory(theaterStore);
        
        // Soft delete the theater store
        theaterStore.setIsActive(false);
        theaterStoreRepository.save(theaterStore);
        
        log.info("Theater store deleted successfully with ID: {}", id);
    }
    
    /**
     * Return quantities from theater store items back to the main inventory (ConsumableItem)
     */
    private void returnQuantitiesToMainInventory(TheaterStore theaterStore) {
        log.info("Returning quantities from theater store '{}' (ID: {}) back to main inventory", 
            theaterStore.getName(), theaterStore.getId());
        
        // Get all active items in this theater store
        List<TheaterStoreItem> theaterStoreItems = theaterStoreItemRepository
            .findByTheaterStoreIdAndIsActiveTrue(theaterStore.getId());
        
        if (theaterStoreItems.isEmpty()) {
            log.info("No items found in theater store '{}' (ID: {}), nothing to return", 
                theaterStore.getName(), theaterStore.getId());
            return;
        }
        
        log.info("Found {} items in theater store '{}' (ID: {}) to return to main inventory", 
            theaterStoreItems.size(), theaterStore.getName(), theaterStore.getId());
        
        for (TheaterStoreItem theaterStoreItem : theaterStoreItems) {
            try {
                ConsumableItem consumableItem = theaterStoreItem.getConsumableItem();
                BigDecimal quantityToReturn = theaterStoreItem.getQuantityAvailable();
                
                if (quantityToReturn != null && quantityToReturn.compareTo(BigDecimal.ZERO) > 0) {
                    // Get current stock in main inventory
                    BigDecimal currentStock = consumableItem.getCurrentStock() != null ? 
                        consumableItem.getCurrentStock() : BigDecimal.ZERO;
                    
                    // Add the returned quantity to main inventory
                    BigDecimal newStock = currentStock.add(quantityToReturn);
                    consumableItem.setCurrentStock(newStock);
                    
                    // Save the updated consumable item
                    consumableItemRepository.save(consumableItem);
                    
                    log.info("Returned {} units of '{}' (ID: {}) from theater store to main inventory. " +
                        "Previous stock: {}, New stock: {}", 
                        quantityToReturn, consumableItem.getName(), consumableItem.getId(), 
                        currentStock, newStock);
                } else {
                    log.info("No quantity to return for item '{}' (ID: {}) in theater store", 
                        consumableItem.getName(), consumableItem.getId());
                }
                
                // Mark the theater store item as inactive (soft delete)
                theaterStoreItem.setIsActive(false);
                theaterStoreItemRepository.save(theaterStoreItem);
                
            } catch (Exception e) {
                log.error("Error returning quantity for item '{}' (ID: {}) from theater store '{}' (ID: {}): {}", 
                    theaterStoreItem.getConsumableItem().getName(), 
                    theaterStoreItem.getConsumableItem().getId(),
                    theaterStore.getName(), 
                    theaterStore.getId(), 
                    e.getMessage(), e);
                // Continue with other items even if one fails
            }
        }
        
        log.info("Completed returning quantities from theater store '{}' (ID: {}) back to main inventory", 
            theaterStore.getName(), theaterStore.getId());
    }
    
    // Get theater stores by store type
    @Transactional(readOnly = true)
    public List<TheaterStoreDto> getTheaterStoresByType(String storeType) {
        log.info("Fetching theater stores by type: {}", storeType);
        
        return theaterStoreRepository.findByStoreTypeAndIsActiveTrue(storeType)
            .stream()
            .map(TheaterStoreDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get theater stores by location
    @Transactional(readOnly = true)
    public List<TheaterStoreDto> getTheaterStoresByLocation(String location) {
        log.info("Fetching theater stores by location: {}", location);
        
        return theaterStoreRepository.findByLocationContainingAndIsActiveTrue(location)
            .stream()
            .map(TheaterStoreDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get theater stores managed by a specific user
    @Transactional(readOnly = true)
    public List<TheaterStoreDto> getTheaterStoresByManager(Long userId) {
        log.info("Fetching theater stores managed by user ID: {}", userId);
        
        return theaterStoreRepository.findByManagedByUserIdAndIsActiveTrue(userId)
            .stream()
            .map(TheaterStoreDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get all consumable items available in theater stores
    @Transactional(readOnly = true)
    public List<TheaterStoreItemDto> getAllTheaterStoreItems() {
        log.info("Fetching all theater store items with available quantity");
        
        return theaterStoreItemRepository.findByIsActiveTrue()
            .stream()
            .filter(item -> item.getQuantityAvailable().compareTo(BigDecimal.ZERO) > 0)
            .map(TheaterStoreItemDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Delete theater store item and return quantity to main store
    public void deleteTheaterStoreItem(Long itemId) {
        log.info("Deleting theater store item ID: {}", itemId);
        
        TheaterStoreItem theaterStoreItem = theaterStoreItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Theater store item not found with ID: " + itemId));
        
        // Get the consumable item to update its stock
        ConsumableItem consumableItem = consumableItemRepository.findById(theaterStoreItem.getConsumableItem().getId())
            .orElseThrow(() -> new RuntimeException("Consumable item not found with ID: " + theaterStoreItem.getConsumableItem().getId()));
        
        // Add the theater store quantity back to the main store
        BigDecimal currentStock = consumableItem.getCurrentStock();
        BigDecimal theaterQuantity = theaterStoreItem.getQuantityAvailable();
        BigDecimal newStock = currentStock.add(theaterQuantity);
        
        consumableItem.setCurrentStock(newStock);
        consumableItemRepository.save(consumableItem);
        
        // Mark the theater store item as inactive (soft delete)
        theaterStoreItem.setIsActive(false);
        theaterStoreItemRepository.save(theaterStoreItem);
        
        log.info("Successfully deleted theater store item ID: {} and returned {} units to main store. New main store stock: {}", 
            itemId, theaterQuantity, newStock);
    }
}
