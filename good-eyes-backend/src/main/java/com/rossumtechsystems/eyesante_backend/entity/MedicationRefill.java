package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "medication_refills")
@Data
@EqualsAndHashCode(callSuper = true)
public class MedicationRefill extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    @Column(name = "original_prescription_id")
    private Long originalPrescriptionId; // Reference to original prescription

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Column(name = "quantity_requested")
    private Integer quantityRequested;

    @Column(name = "quantity_dispensed")
    private Integer quantityDispensed;

    @Column(name = "remaining_doses")
    private Integer remainingDoses;

    @Column(name = "refill_reason", columnDefinition = "TEXT")
    private String refillReason;

    @Column(name = "patient_compliant")
    private Boolean patientCompliant; // Whether patient has been taking medication as prescribed

    @Column(name = "side_effects_reported")
    private String sideEffectsReported;

    @Column(name = "effectiveness_rating")
    private Integer effectivenessRating; // 1-5 scale

    @Column(name = "refill_approved")
    private Boolean refillApproved = false;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "dispensed_by")
    private String dispensedBy;

    @Column(name = "dispense_date")
    private LocalDateTime dispenseDate;

    @Column(name = "next_refill_date")
    private LocalDateTime nextRefillDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
} 