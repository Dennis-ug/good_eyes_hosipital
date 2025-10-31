package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consumable_restock")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsumableRestock {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumable_item_id")
    private ConsumableItem consumableItem;
    
    @Column(name = "quantity_added", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityAdded;
    
    @Column(name = "restock_date", nullable = false)
    private LocalDateTime restockDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restocked_by_user_id")
    private User restockedByUser;
    
    @Column(name = "supplier_name", length = 200)
    private String supplierName;
    
    @Column(name = "cost_per_unit", precision = 10, scale = 2)
    private BigDecimal costPerUnit;
    
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (restockDate == null) {
            restockDate = LocalDateTime.now();
        }
    }
}
