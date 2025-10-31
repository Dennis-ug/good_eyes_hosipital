package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_diagnoses")
@Data
@EqualsAndHashCode(callSuper = true)
public class PatientDiagnosis extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnosis_id", nullable = false)
    private Diagnosis diagnosis;

    @Column(name = "diagnosis_date", nullable = false)
    private LocalDateTime diagnosisDate;

    @Column(name = "severity")
    @Enumerated(EnumType.STRING)
    private DiagnosisSeverity severity;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_primary_diagnosis")
    private Boolean isPrimaryDiagnosis = false;

    @Column(name = "is_confirmed")
    private Boolean isConfirmed = false;

    @Column(name = "diagnosed_by")
    private String diagnosedBy; // Doctor/Staff member who made the diagnosis

    @Column(name = "eye_side")
    @Enumerated(EnumType.STRING)
    private EyeSide eyeSide; // LEFT, RIGHT, BOTH

    public enum EyeSide {
        LEFT, RIGHT, BOTH
    }

    public enum DiagnosisSeverity {
        MILD,
        MODERATE,
        SEVERE,
        CRITICAL
    }
}
