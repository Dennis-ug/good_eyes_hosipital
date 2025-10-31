package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_investigations")
@Data
@EqualsAndHashCode(callSuper = true)
public class PatientInvestigation extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "investigation_type_id", nullable = false)
    private InvestigationType investigationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "eye_side")
    private EyeSide eyeSide;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "billed", nullable = false)
    private Boolean billed = false;

    @Column(name = "billed_at")
    private LocalDateTime billedAt;

    public enum EyeSide {
        LEFT, RIGHT, BOTH
    }
}


