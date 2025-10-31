package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    
    Optional<InventoryItem> findBySku(String sku);
    
    List<InventoryItem> findByIsActiveTrue();
    
    Page<InventoryItem> findByIsActiveTrue(Pageable pageable);
    
    List<InventoryItem> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    List<InventoryItem> findByQuantityInStockLessThanEqualAndIsActiveTrue(Integer minimumStockLevel);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.isActive = true AND LOWER(i.name) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<InventoryItem> findActiveByNameContainingIgnoreCase(String name);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.isActive = true AND LOWER(i.sku) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<InventoryItem> findActiveBySkuContainingIgnoreCase(String sku);
    
    List<InventoryItem> findByQuantityInStockGreaterThanAndIsActiveTrue(Integer quantity);
    
    boolean existsBySku(String sku);
    
    // Drug-specific search methods
    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = 'DRUGS' AND LOWER(i.name) LIKE LOWER(CONCAT('%', ?1, '%')) AND i.isActive = true")
    List<InventoryItem> findByCategoryNameAndNameContainingIgnoreCase(String categoryName, String name);
    
    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = ?1 AND i.quantityInStock > ?2 AND i.isActive = true")
    List<InventoryItem> findByCategoryNameAndQuantityInStockGreaterThan(String categoryName, Integer quantity);
    
    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = ?1 AND i.isActive = true")
    List<InventoryItem> findByCategoryName(String categoryName);
    
    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = ?1 AND i.quantityInStock <= ?2 AND i.isActive = true")
    List<InventoryItem> findByCategoryNameAndQuantityInStockLessThanEqual(String categoryName, Integer quantity);
    
    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = ?1 AND i.sku = ?2 AND i.isActive = true")
    Optional<InventoryItem> findByCategoryNameAndSku(String categoryName, String sku);
    
    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = 'DRUGS' AND i.isActive = true " +
           "AND (?1 IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', ?1, '%'))) " +
           "AND (?2 IS NULL OR c.name = ?2) " +
           "AND (?3 IS NULL OR i.quantityInStock > 0) " +
           "AND (?4 IS NULL OR i.unitPrice >= ?4) " +
           "AND (?5 IS NULL OR i.unitPrice <= ?5)")
    List<InventoryItem> findDrugsWithAdvancedFilters(String name, String category, Boolean inStock, Double minPrice, Double maxPrice);
    
    // Additional drug-specific queries
    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = 'DRUGS' AND i.isActive = true " +
           "AND i.expiryDate IS NOT NULL AND i.expiryDate <= :thresholdDate")
    List<InventoryItem> findExpiringDrugs(LocalDate thresholdDate);

    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = 'DRUGS' AND i.isActive = true " +
           "AND i.requiresPrescription = true")
    List<InventoryItem> findPrescriptionDrugs();

    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE c.name = 'DRUGS' AND i.isActive = true " +
           "AND i.controlledSubstance = true")
    List<InventoryItem> findControlledSubstances();

    // Frame-specific methods (lenses are generated dynamically)
    Page<InventoryItem> findByOpticsType(String opticsType, Pageable pageable);
    
    // Case-insensitive search across name, SKU, and category name
    @Query("SELECT i FROM InventoryItem i JOIN i.category c WHERE i.isActive = true AND " +
           "(LOWER(i.name) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(i.sku) LIKE LOWER(CONCAT('%', ?2, '%')) OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', ?3, '%')))")
    Page<InventoryItem> findByIsActiveTrueAndNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrCategoryNameContainingIgnoreCase(
            String name, String sku, String categoryName, Pageable pageable);

    Page<InventoryItem> findByOpticsTypeAndFrameShape(String opticsType, String frameShape, Pageable pageable);

    Page<InventoryItem> findByOpticsTypeAndFrameMaterial(String opticsType, String frameMaterial, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE i.opticsType = 'FRAME' AND i.brand = :brand AND i.isActive = true")
    Page<InventoryItem> findByOpticsTypeAndBrand(String opticsType, String brand, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE i.opticsType = 'FRAME' AND i.isActive = true AND " +
           "(LOWER(i.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<InventoryItem> findByOpticsTypeInAndNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            List<String> opticsTypes, String searchTerm, String searchTerm2, Pageable pageable);

    @Query("SELECT DISTINCT i.frameShape FROM InventoryItem i WHERE i.frameShape IS NOT NULL AND i.opticsType = 'FRAME' AND i.isActive = true")
    List<String> findDistinctFrameShapes();

    @Query("SELECT DISTINCT i.frameMaterial FROM InventoryItem i WHERE i.frameMaterial IS NOT NULL AND i.opticsType = 'FRAME' AND i.isActive = true")
    List<String> findDistinctFrameMaterials();

    @Query("SELECT DISTINCT i.brand FROM InventoryItem i WHERE i.brand IS NOT NULL AND i.opticsType = 'FRAME' AND i.isActive = true")
    List<String> findDistinctBrands();

    // Frames from inventory regardless of optics_type, using category fallback ('Eye Glasses')
    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType = 'FRAME' OR c.name = 'FRAMES')")
    Page<InventoryItem> findAllFramesFromInventory(Pageable pageable);

    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType = 'FRAME' OR c.name = 'FRAMES') AND i.frameShape = :frameShape")
    Page<InventoryItem> findFramesByShapeFromInventory(String frameShape, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType = 'FRAME' OR c.name = 'FRAMES') AND i.frameMaterial = :frameMaterial")
    Page<InventoryItem> findFramesByMaterialFromInventory(String frameMaterial, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType = 'FRAME' OR c.name = 'FRAMES') AND i.brand = :brand")
    Page<InventoryItem> findFramesByBrandFromInventory(String brand, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType = 'FRAME' OR c.name = 'FRAMES') AND (" +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.brand) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.model) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.sku) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<InventoryItem> searchFramesFromInventory(String q, Pageable pageable);

    // Unified optical items search (both frames and lenses from inventory)
    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType IN ('FRAME', 'LENS') OR c.name IN ('FRAMES', 'LENSES', 'OPTICAL')) AND (" +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.brand) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.model) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.sku) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(i.opticsType) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<InventoryItem> searchAllOpticalItemsFromInventory(String q, Pageable pageable);

    // Get all optical items (frames and lenses)
    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType IN ('FRAME', 'LENS') OR c.name IN ('FRAMES', 'LENSES', 'OPTICAL'))")
    Page<InventoryItem> findAllOpticalItemsFromInventory(Pageable pageable);

    // Get optical items by type (FRAME or LENS)
    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType = :opticsType OR " +
           "(c.name = :categoryName AND :opticsType = 'FRAME' AND c.name = 'FRAMES') OR " +
           "(c.name = :categoryName AND :opticsType = 'LENS' AND c.name = 'LENSES'))")
    Page<InventoryItem> findOpticalItemsByTypeFromInventory(String opticsType, String categoryName, Pageable pageable);

    // Get optical items by brand (frames and lenses)
    @Query("SELECT i FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.isActive = true AND (i.opticsType IN ('FRAME', 'LENS') OR c.name IN ('FRAMES', 'LENSES', 'OPTICAL')) AND i.brand = :brand")
    Page<InventoryItem> findOpticalItemsByBrandFromInventory(String brand, Pageable pageable);

    // Get distinct optical item brands (frames and lenses)
    @Query("SELECT DISTINCT i.brand FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.brand IS NOT NULL AND i.isActive = true AND (i.opticsType IN ('FRAME', 'LENS') OR c.name IN ('FRAMES', 'LENSES', 'OPTICAL'))")
    List<String> findDistinctOpticalItemBrands();

    // Get distinct lens materials from inventory
    @Query("SELECT DISTINCT i.frameMaterial FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.frameMaterial IS NOT NULL AND i.isActive = true AND (i.opticsType = 'LENS' OR c.name = 'LENSES')")
    List<String> findDistinctLensMaterials();

    // Get distinct lens types from inventory
    @Query("SELECT DISTINCT i.frameShape FROM InventoryItem i LEFT JOIN i.category c " +
           "WHERE i.frameShape IS NOT NULL AND i.isActive = true AND (i.opticsType = 'LENS' OR c.name = 'LENSES')")
    List<String> findDistinctLensTypes();
} 