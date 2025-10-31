package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "theater_requisition_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterRequisitionItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    private TheaterRequisition requisition;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumable_item_id", nullable = false)
    private ConsumableItem consumableItem;
    
    @Column(name = "quantity_requested", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityRequested;
    
    @Column(name = "quantity_approved", precision = 10, scale = 2)
    private BigDecimal quantityApproved = BigDecimal.ZERO;
    
    @Column(name = "quantity_fulfilled", precision = 10, scale = 2)
    private BigDecimal quantityFulfilled = BigDecimal.ZERO;
    
    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;
    
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Column(name = "purpose", length = 100)
    private String purpose;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
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

