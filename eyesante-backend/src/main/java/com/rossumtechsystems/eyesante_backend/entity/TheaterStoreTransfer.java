package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "theater_store_transfers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterStoreTransfer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id")
    private TheaterRequisition requisition;
    
    @Column(name = "from_store", nullable = false, length = 100)
    private String fromStore = "General Store";
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_theater_store_id")
    private TheaterStore toTheaterStore;
    
    @Column(name = "transfer_date", nullable = false)
    private LocalDateTime transferDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transferred_by_user_id")
    private User transferredBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private TransferStatus status = TransferStatus.PENDING;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @OneToMany(mappedBy = "transfer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TheaterStoreTransferItem> transferItems;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (transferDate == null) {
            transferDate = LocalDateTime.now();
        }
    }
    
    public enum TransferStatus {
        PENDING, COMPLETED, CANCELLED
    }
}

