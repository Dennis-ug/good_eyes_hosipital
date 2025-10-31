package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Entity
@Table(name = "triage_measurements")
@Data
@EqualsAndHashCode(callSuper = true)
public class TriageMeasurement extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    // Blood Pressure
    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    // Random Blood Sugar
    @Column(name = "rbs_value")
    private BigDecimal rbsValue;

    @Column(name = "rbs_unit")
    private String rbsUnit = "mg/dL";

    // Intraocular Pressure
    @Column(name = "iop_right")
    private Integer iopRight;

    @Column(name = "iop_left")
    private Integer iopLeft;

    // Weight
    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "weight_lbs")
    private BigDecimal weightLbs;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "measured_by")
    private String measuredBy;

    @Column(name = "measurement_date")
    private java.time.LocalDateTime measurementDate;
} 