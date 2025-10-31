package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.*;
import com.rossumtechsystems.eyesante_backend.entity.*;
import com.rossumtechsystems.eyesante_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class TheaterRequisitionService {
    
    @Autowired
    private TheaterRequisitionRepository requisitionRepository;
    
    @Autowired
    private TheaterRequisitionItemRepository requisitionItemRepository;
    
    @Autowired
    private ConsumableItemRepository consumableItemRepository;
    
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private PatientProcedureRepository patientProcedureRepository;
    
    @Autowired
    private TheaterStoreRepository theaterStoreRepository;

    @Autowired
    private TimeService timeService;
    
    @Autowired
    private TheaterStoreTransferRepository transferRepository;
    
    @Autowired
    private TheaterStoreTransferItemRepository transferItemRepository;
    
    @Autowired
    private TheaterStoreItemRepository theaterStoreItemRepository;
    
    // Create a new requisition
    public TheaterRequisitionDto createRequisition(CreateTheaterRequisitionRequest request) {
        // Validate required fields
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Title is required");
        }
        if (request.getRequisitionItems() == null || request.getRequisitionItems().isEmpty()) {
            throw new RuntimeException("At least one item must be added to the requisition");
        }

        TheaterRequisition requisition = new TheaterRequisition();
        requisition.setTitle(request.getTitle().trim());
        requisition.setDescription(request.getDescription());
        requisition.setRequiredDate(request.getRequiredDate());
        requisition.setPriority(TheaterRequisition.RequisitionPriority.valueOf(request.getPriority()));
        requisition.setNotes(request.getNotes());
        
        // Set requested by current user
        User currentUser = getCurrentUser();
        requisition.setRequestedBy(currentUser);
        
        // Set department if provided
        if (request.getDepartmentId() != null) {
            Optional<Department> department = departmentRepository.findById(request.getDepartmentId());
            department.ifPresent(requisition::setDepartment);
        }
        
        // Set patient procedure if provided
        if (request.getPatientProcedureId() != null) {
            Optional<PatientProcedure> procedure = patientProcedureRepository.findById(request.getPatientProcedureId());
            procedure.ifPresent(requisition::setPatientProcedure);
        }
        
        // Generate requisition number
        requisition.setRequisitionNumber(generateRequisitionNumber());
        
        TheaterRequisition savedRequisition = requisitionRepository.save(requisition);
        
        // Add requisition items
        if (request.getRequisitionItems() != null) {
            // Detect duplicates: same consumableItemId and same quantityRequested
            Set<String> seen = new HashSet<>();
            for (CreateTheaterRequisitionRequest.TheaterRequisitionItemRequest itemRequest : request.getRequisitionItems()) {
                String key = itemRequest.getConsumableItemId() + "|" + itemRequest.getQuantityRequested();
                if (!seen.add(key)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate item with same quantity detected. Consider merging instead of adding a duplicate.");
                }
            }
            for (CreateTheaterRequisitionRequest.TheaterRequisitionItemRequest itemRequest : request.getRequisitionItems()) {
                TheaterRequisitionItem item = new TheaterRequisitionItem();
                item.setRequisition(savedRequisition);

                Optional<ConsumableItem> consumableItem = consumableItemRepository.findById(itemRequest.getConsumableItemId());
                if (consumableItem.isPresent()) {
                    ConsumableItem existingItem = consumableItem.get();

                    BigDecimal requestedQty = BigDecimal.valueOf(itemRequest.getQuantityRequested());
                    if (requestedQty.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than 0 for item: " + existingItem.getName());
                    }
                    BigDecimal available = existingItem.getCurrentStock() != null ? existingItem.getCurrentStock() : BigDecimal.ZERO;
                    // Must be strictly less than stock
                    if (requestedQty.compareTo(available) >= 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested quantity (" + requestedQty + ") must be less than available stock (" + available + ") for item: " + existingItem.getName());
                    }

                    item.setConsumableItem(existingItem);
                    item.setQuantityRequested(requestedQty);
                    item.setPurpose(itemRequest.getPurpose());
                    item.setNotes(itemRequest.getNotes());

                    // Set unit cost from consumable item
                    if (existingItem.getCostPerUnit() != null) {
                        item.setUnitCost(existingItem.getCostPerUnit());
                        item.setTotalCost(item.getUnitCost().multiply(item.getQuantityRequested()));
                    }

                    requisitionItemRepository.save(item);
                } else {
                    throw new RuntimeException("Consumable item not found");
                }
            }
        }
        
        return TheaterRequisitionDto.fromEntity(savedRequisition);
    }
    
    // Submit requisition for approval
    public TheaterRequisitionDto submitRequisition(Long requisitionId) {
        Optional<TheaterRequisition> optional = requisitionRepository.findById(requisitionId);
        if (optional.isPresent()) {
            TheaterRequisition requisition = optional.get();
            if (requisition.getStatus() == TheaterRequisition.RequisitionStatus.DRAFT) {
                requisition.setStatus(TheaterRequisition.RequisitionStatus.SUBMITTED);
                TheaterRequisition saved = requisitionRepository.save(requisition);
                return TheaterRequisitionDto.fromEntity(saved);
            }
            throw new RuntimeException("Requisition is not in DRAFT status");
        }
        throw new RuntimeException("Requisition not found");
    }
    
    // Approve or reject requisition
    public TheaterRequisitionDto approveRequisition(Long requisitionId, ApproveTheaterRequisitionRequest request) {
        Optional<TheaterRequisition> optional = requisitionRepository.findById(requisitionId);
        if (optional.isPresent()) {
            TheaterRequisition requisition = optional.get();
            User currentUser = getCurrentUser();
            
            if ("APPROVE".equals(request.getAction())) {
                requisition.setStatus(TheaterRequisition.RequisitionStatus.APPROVED);
                requisition.setApprovedBy(currentUser);
                requisition.setApprovedDate(timeService.getCurrentDateTime());
                
                // Update item approvals
                if (request.getItemApprovals() != null) {
                    for (ApproveTheaterRequisitionRequest.TheaterRequisitionItemApproval approval : request.getItemApprovals()) {
                        Optional<TheaterRequisitionItem> itemOptional = requisitionItemRepository.findById(approval.getRequisitionItemId());
                        if (itemOptional.isPresent()) {
                            TheaterRequisitionItem item = itemOptional.get();
                            item.setQuantityApproved(BigDecimal.valueOf(approval.getQuantityApproved()));
                            if (approval.getNotes() != null) {
                                item.setNotes(approval.getNotes());
                            }
                            requisitionItemRepository.save(item);
                        }
                    }
                }
                
                // Create stock transfer
                createStockTransfer(requisition);
                
            } else if ("REJECT".equals(request.getAction())) {
                requisition.setStatus(TheaterRequisition.RequisitionStatus.REJECTED);
                requisition.setRejectionReason(request.getRejectionReason());
            }
            
            TheaterRequisition saved = requisitionRepository.save(requisition);
            return TheaterRequisitionDto.fromEntity(saved);
        }
        throw new RuntimeException("Requisition not found");
    }
    
    // Create stock transfer from general store to theater store
    private void createStockTransfer(TheaterRequisition requisition) {
        log.info("Starting stock transfer for requisition ID: {}", requisition.getId());
        
        TheaterStoreTransfer transfer = new TheaterStoreTransfer();
        transfer.setRequisition(requisition);
        transfer.setFromStore("General Store");
        transfer.setTransferredBy(getCurrentUser());
        
        // Find the appropriate theater store (default to first available)
        List<TheaterStore> stores = theaterStoreRepository.findByIsActiveTrue();
        TheaterStore targetStore;
        
        if (stores.isEmpty()) {
            log.warn("No active theater stores found for requisition ID: {}. Creating default theater store.", requisition.getId());
            // Create a default theater store
            targetStore = createDefaultTheaterStore();
            log.info("Created default theater store: {} (ID: {}) for requisition ID: {}", 
                targetStore.getName(), targetStore.getId(), requisition.getId());
        } else {
            targetStore = stores.get(0);
        }
        transfer.setToTheaterStore(targetStore);
        log.info("Selected theater store: {} (ID: {}) for requisition ID: {}", targetStore.getName(), targetStore.getId(), requisition.getId());
        
        TheaterStoreTransfer savedTransfer = transferRepository.save(transfer);
        log.info("Created transfer record with ID: {} for requisition ID: {}", savedTransfer.getId(), requisition.getId());
        
        // Get approved items for this requisition
        List<TheaterRequisitionItem> approvedItems = requisitionItemRepository.findApprovedItemsByRequisitionId(requisition.getId());
        log.info("Found {} approved items for requisition ID: {}", approvedItems.size(), requisition.getId());
        
        for (TheaterRequisitionItem requisitionItem : approvedItems) {
            ConsumableItem consumableItem = requisitionItem.getConsumableItem();
            BigDecimal quantityToTransfer = requisitionItem.getQuantityApproved();
            
            log.info("Processing item: {} (ID: {}), quantity to transfer: {}", 
                consumableItem.getName(), consumableItem.getId(), quantityToTransfer);
            
            // Validate that we have enough stock in the general store
            BigDecimal availableStock = consumableItem.getCurrentStock() != null ? consumableItem.getCurrentStock() : BigDecimal.ZERO;
            if (quantityToTransfer.compareTo(availableStock) > 0) {
                log.error("Insufficient stock for item: {} (ID: {}). Available: {}, Required: {}", 
                    consumableItem.getName(), consumableItem.getId(), availableStock, quantityToTransfer);
                throw new RuntimeException("Insufficient stock in general store for item: " + consumableItem.getName() + 
                    ". Available: " + availableStock + ", Required: " + quantityToTransfer);
            }
            
            // Reduce stock in general store (ConsumableItem)
            BigDecimal newStock = availableStock.subtract(quantityToTransfer);
            consumableItem.setCurrentStock(newStock);
            consumableItemRepository.save(consumableItem);
            log.info("Reduced stock for item: {} (ID: {}) from {} to {}", 
                consumableItem.getName(), consumableItem.getId(), availableStock, newStock);
            
            // Add stock to theater store
            addStockToTheaterStore(targetStore, consumableItem, quantityToTransfer, requisitionItem.getUnitCost());
            log.info("Added {} units of item: {} (ID: {}) to theater store: {} (ID: {})", 
                quantityToTransfer, consumableItem.getName(), consumableItem.getId(), targetStore.getName(), targetStore.getId());
            
            // Create transfer item record
            TheaterStoreTransferItem transferItem = new TheaterStoreTransferItem();
            transferItem.setTransfer(savedTransfer);
            transferItem.setConsumableItem(consumableItem);
            transferItem.setQuantityTransferred(quantityToTransfer);
            transferItem.setUnitCost(requisitionItem.getUnitCost());
            transferItem.setTotalCost(requisitionItem.getTotalCost());
            transferItemRepository.save(transferItem);
            log.info("Created transfer item record for item: {} (ID: {})", consumableItem.getName(), consumableItem.getId());
        }
        
        log.info("Completed stock transfer for requisition ID: {}", requisition.getId());
    }
    
    // Add stock to theater store
    private void addStockToTheaterStore(TheaterStore theaterStore, ConsumableItem consumableItem, BigDecimal quantity, BigDecimal unitCost) {
        log.info("Adding stock to theater store - Store: {} (ID: {}), Item: {} (ID: {}), Quantity: {}", 
            theaterStore.getName(), theaterStore.getId(), consumableItem.getName(), consumableItem.getId(), quantity);
        
        // Check if this item already exists in the theater store
        List<TheaterStoreItem> existingItems = theaterStoreItemRepository.findByTheaterStoreAndConsumableItem(
            theaterStore.getId(), consumableItem.getId());
        
        if (!existingItems.isEmpty()) {
            // Add to existing item
            TheaterStoreItem existingItem = existingItems.get(0);
            BigDecimal currentQuantity = existingItem.getQuantityAvailable() != null ? existingItem.getQuantityAvailable() : BigDecimal.ZERO;
            BigDecimal newQuantity = currentQuantity.add(quantity);
            existingItem.setQuantityAvailable(newQuantity);
            existingItem.setLastRestocked(timeService.getCurrentDateTime());
            theaterStoreItemRepository.save(existingItem);
            log.info("Updated existing theater store item - Item: {} (ID: {}), Previous quantity: {}, New quantity: {}", 
                consumableItem.getName(), consumableItem.getId(), currentQuantity, newQuantity);
        } else {
            // Create new theater store item
            TheaterStoreItem newItem = new TheaterStoreItem();
            newItem.setTheaterStore(theaterStore);
            newItem.setConsumableItem(consumableItem);
            newItem.setQuantityAvailable(quantity);
            newItem.setMinimumQuantity(BigDecimal.ZERO);
            newItem.setMaximumQuantity(BigDecimal.valueOf(1000)); // Default max quantity
            newItem.setLastRestocked(timeService.getCurrentDateTime());
            newItem.setIsSterile(false); // Default to non-sterile
            newItem.setIsActive(true);
            newItem.setBatchNumber("REQ-" + System.currentTimeMillis()); // Generate batch number
            TheaterStoreItem savedItem = theaterStoreItemRepository.save(newItem);
            log.info("Created new theater store item - Item: {} (ID: {}), Theater Store Item ID: {}, Quantity: {}", 
                consumableItem.getName(), consumableItem.getId(), savedItem.getId(), quantity);
        }
    }
    
    // Create a default theater store
    private TheaterStore createDefaultTheaterStore() {
        TheaterStore defaultStore = new TheaterStore();
        defaultStore.setName("Main Theater Store");
        defaultStore.setDescription("Default theater store created automatically for stock transfers");
        defaultStore.setLocation("Main Theater Building");
        defaultStore.setStoreType("SURGICAL");
        defaultStore.setCapacity(1000);
        defaultStore.setIsActive(true);
        defaultStore.setCreatedAt(timeService.getCurrentDateTime());
        defaultStore.setUpdatedAt(timeService.getCurrentDateTime());
        
        TheaterStore savedStore = theaterStoreRepository.save(defaultStore);
        log.info("Created default theater store with ID: {}", savedStore.getId());
        return savedStore;
    }
    
    // Get all requisitions
    public Page<TheaterRequisitionDto> getAllRequisitions(Pageable pageable) {
        return requisitionRepository.findAll(pageable)
            .map(TheaterRequisitionDto::fromEntity);
    }
    
    // Get requisitions by status
    public List<TheaterRequisitionDto> getRequisitionsByStatus(String status) {
        TheaterRequisition.RequisitionStatus requisitionStatus = TheaterRequisition.RequisitionStatus.valueOf(status);
        return requisitionRepository.findByStatus(requisitionStatus)
            .stream()
            .map(TheaterRequisitionDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get pending approvals
    public List<TheaterRequisitionDto> getPendingApprovals() {
        return requisitionRepository.findPendingApprovals()
            .stream()
            .map(TheaterRequisitionDto::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Get requisition by ID
    public TheaterRequisitionDto getRequisitionById(Long id) {
        Optional<TheaterRequisition> optional = requisitionRepository.findById(id);
        if (optional.isPresent()) {
            return TheaterRequisitionDto.fromEntity(optional.get());
        }
        throw new RuntimeException("Requisition not found");
    }
    
    // Generate requisition number
    private String generateRequisitionNumber() {
        // This would typically call a database function
        return "TR-" + timeService.getCurrentDateTime().getYear() + "-" + String.format("%06d", System.currentTimeMillis() % 1000000);
    }
    
    // Update requisition (only for DRAFT status)
    public TheaterRequisitionDto updateRequisition(Long requisitionId, CreateTheaterRequisitionRequest request) {
        TheaterRequisition requisition = requisitionRepository.findById(requisitionId)
            .orElseThrow(() -> new RuntimeException("Requisition not found"));

        // Only allow updating DRAFT requisitions
        if (!requisition.getStatus().equals(TheaterRequisition.RequisitionStatus.DRAFT)) {
            throw new RuntimeException("Only DRAFT requisitions can be updated");
        }

        // Verify user has permission to update this requisition
        User currentUser = getCurrentUser();
        if (!requisition.getRequestedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only update your own requisitions");
        }

        // Validate required fields
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Title is required");
        }
        if (request.getRequisitionItems() == null || request.getRequisitionItems().isEmpty()) {
            throw new RuntimeException("At least one item must be added to the requisition");
        }

        // Update basic fields
        requisition.setTitle(request.getTitle().trim());
        requisition.setDescription(request.getDescription());
        if (request.getRequiredDate() != null) {
            requisition.setRequiredDate(request.getRequiredDate());
        }
        if (request.getPriority() != null) {
            requisition.setPriority(TheaterRequisition.RequisitionPriority.valueOf(request.getPriority()));
        }
        if (request.getNotes() != null) {
            requisition.setNotes(request.getNotes());
        }
        requisition.setUpdatedAt(timeService.getCurrentDateTime());

        // Update requisition items - complete replacement
        // First, delete all existing items for this requisition
        List<TheaterRequisitionItem> existingItems = requisitionItemRepository.findByRequisitionId(requisitionId);
        System.out.println("Found " + existingItems.size() + " existing items for requisition " + requisitionId);

        if (!existingItems.isEmpty()) {
            System.out.println("Deleting " + existingItems.size() + " existing items for requisition " + requisitionId);
            // Use individual delete for better transaction safety
            for (TheaterRequisitionItem item : existingItems) {
                requisitionItemRepository.delete(item);
            }
            System.out.println("Successfully deleted existing items");
            // Flush to ensure deletions are committed before creating new items
            requisitionItemRepository.flush();
        }

        // Then, create new items from the request
        if (request.getRequisitionItems() != null && !request.getRequisitionItems().isEmpty()) {
            System.out.println("Creating " + request.getRequisitionItems().size() + " new items for requisition " + requisitionId);

            // Debug: print what items are being received
            for (int i = 0; i < request.getRequisitionItems().size(); i++) {
                CreateTheaterRequisitionRequest.TheaterRequisitionItemRequest item = request.getRequisitionItems().get(i);
                System.out.println("Item " + i + ": consumableId=" + item.getConsumableItemId() +
                    ", quantity=" + item.getQuantityRequested() + ", purpose=" + item.getPurpose());
            }

            for (CreateTheaterRequisitionRequest.TheaterRequisitionItemRequest itemRequest : request.getRequisitionItems()) {
                ConsumableItem consumableItem = consumableItemRepository.findById(itemRequest.getConsumableItemId())
                    .orElseThrow(() -> new RuntimeException("Consumable item not found"));

                BigDecimal requestedQty = BigDecimal.valueOf(itemRequest.getQuantityRequested());
                if (requestedQty.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than 0 for item: " + consumableItem.getName());
                }
                BigDecimal available = consumableItem.getCurrentStock() != null ? consumableItem.getCurrentStock() : BigDecimal.ZERO;
                if (requestedQty.compareTo(available) >= 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested quantity (" + requestedQty + ") must be less than available stock (" + available + ") for item: " + consumableItem.getName());
                }

                TheaterRequisitionItem item = new TheaterRequisitionItem();
                item.setRequisition(requisition);
                item.setConsumableItem(consumableItem);
                item.setQuantityRequested(requestedQty);
                item.setPurpose(itemRequest.getPurpose());
                item.setNotes(itemRequest.getNotes());
                item.setUnitCost(consumableItem.getCostPerUnit());
                if (consumableItem.getCostPerUnit() != null) {
                    item.setTotalCost(consumableItem.getCostPerUnit().multiply(requestedQty));
                }
                item.setCreatedAt(timeService.getCurrentDateTime());
                item.setUpdatedAt(timeService.getCurrentDateTime());

                requisitionItemRepository.save(item);
            }
        }

        TheaterRequisition savedRequisition = requisitionRepository.save(requisition);
        return TheaterRequisitionDto.fromEntity(savedRequisition);
    }

    // Delete requisition (allows all statuses)
    public void deleteRequisition(Long requisitionId) {
        log.info("Attempting to delete requisition with ID: {}", requisitionId);
        
        TheaterRequisition requisition = requisitionRepository.findById(requisitionId)
            .orElseThrow(() -> {
                log.error("Requisition not found with ID: {}", requisitionId);
                return new RuntimeException("Requisition not found with ID: " + requisitionId);
            });

        log.info("Found requisition: {} (Status: {})", requisition.getRequisitionNumber(), requisition.getStatus());
        
        // Allow deleting requisitions of any status

        // Verify user has permission to delete this requisition
        User currentUser = getCurrentUser();
        if (!requisition.getRequestedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own requisitions");
        }

        // Delete associated items first (cascade should handle this, but let's be explicit)
        log.info("Deleting associated items for requisition ID: {}", requisitionId);
        requisitionItemRepository.deleteByRequisitionId(requisitionId);

        // Delete the requisition
        log.info("Deleting requisition: {}", requisition.getRequisitionNumber());
        requisitionRepository.delete(requisition);
        
        log.info("Successfully deleted requisition with ID: {}", requisitionId);
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

