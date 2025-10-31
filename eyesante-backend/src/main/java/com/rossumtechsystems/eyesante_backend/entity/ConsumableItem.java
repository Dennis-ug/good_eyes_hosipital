package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consumable_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsumableItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ConsumableCategory category;
    
    @Column(name = "sku", unique = true, length = 50)
    private String sku;
    
    @Column(name = "unit_of_measure", nullable = false, length = 20)
    private String unitOfMeasure;
    
    @Column(name = "current_stock", precision = 10, scale = 2)
    private BigDecimal currentStock = BigDecimal.ZERO;
    
    @Column(name = "minimum_stock_level", precision = 10, scale = 2)
    private BigDecimal minimumStockLevel = BigDecimal.ZERO;
    
    @Column(name = "maximum_stock_level", precision = 10, scale = 2)
    private BigDecimal maximumStockLevel = BigDecimal.ZERO;
    
    @Column(name = "reorder_point", precision = 10, scale = 2)
    private BigDecimal reorderPoint = BigDecimal.ZERO;
    
    @Column(name = "reorder_quantity", precision = 10, scale = 2)
    private BigDecimal reorderQuantity = BigDecimal.ZERO;
    
    @Column(name = "supplier_name", length = 200)
    private String supplierName;
    
    @Column(name = "supplier_contact", length = 100)
    private String supplierContact;
    
    @Column(name = "cost_per_unit", precision = 10, scale = 2)
    private BigDecimal costPerUnit;
    
    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "store", length = 100, nullable = false)
    private String store = "General Store";

    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
