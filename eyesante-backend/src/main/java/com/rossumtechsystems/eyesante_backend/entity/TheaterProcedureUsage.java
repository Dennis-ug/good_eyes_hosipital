package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "theater_procedure_usage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterProcedureUsage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_procedure_id", nullable = false)
    private PatientProcedure patientProcedure;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumable_item_id", nullable = false)
    private ConsumableItem consumableItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_store_id")
    private TheaterStore theaterStore;
    
    @Column(name = "quantity_used", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityUsed;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "used_by_user_id", nullable = false)
    private User usedBy;
    
    @Column(name = "usage_date", nullable = false)
    private LocalDateTime usageDate;
    
    @Column(name = "batch_number", length = 50)
    private String batchNumber;
    
    @Column(name = "purpose", length = 100)
    private String purpose;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (usageDate == null) {
            usageDate = LocalDateTime.now();
        }
    }
}

