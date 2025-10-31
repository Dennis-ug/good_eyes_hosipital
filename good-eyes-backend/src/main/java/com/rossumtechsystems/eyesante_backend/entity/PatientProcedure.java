package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_procedures")
@Data
@EqualsAndHashCode(callSuper = true)
public class PatientProcedure extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "procedure_id", nullable = false)
    private Procedure procedure;

    @Enumerated(EnumType.STRING)
    @Column(name = "eye_side", nullable = false)
    private EyeSide eyeSide;

    @Column(name = "cost", precision = 10, scale = 2, nullable = false)
    private BigDecimal cost;

    @Column(name = "performed", nullable = false)
    private Boolean performed = false;

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "performed_date")
    private LocalDateTime performedDate;

    @Column(name = "staff_fee", precision = 10, scale = 2)
    private BigDecimal staffFee;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum EyeSide {
        LEFT, RIGHT, BOTH
    }
}
