package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "theater_store_items", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"theater_store_id", "consumable_item_id", "batch_number"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterStoreItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_store_id", nullable = false)
    private TheaterStore theaterStore;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumable_item_id", nullable = false)
    private ConsumableItem consumableItem;
    
    @Column(name = "quantity_available", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityAvailable = BigDecimal.ZERO;
    
    @Column(name = "minimum_quantity", precision = 10, scale = 2)
    private BigDecimal minimumQuantity = BigDecimal.ZERO;
    
    @Column(name = "maximum_quantity", precision = 10, scale = 2)
    private BigDecimal maximumQuantity = BigDecimal.ZERO;
    
    @Column(name = "last_restocked")
    private LocalDateTime lastRestocked;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "batch_number", length = 50)
    private String batchNumber;
    
    @Column(name = "is_sterile", nullable = false)
    private Boolean isSterile = false;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @OneToMany(mappedBy = "theaterStoreItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TheaterStoreUsage> usages;
    
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

