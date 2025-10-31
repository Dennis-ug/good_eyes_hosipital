package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergencies")
@Data
@EqualsAndHashCode(callSuper = true)
public class Emergency extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    @Column(name = "emergency_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EmergencyType emergencyType;

    @Column(name = "priority_level", nullable = false)
    @Enumerated(EnumType.STRING)
    private PriorityLevel priorityLevel;

    @Column(name = "chief_complaint", columnDefinition = "TEXT", nullable = false)
    private String chiefComplaint;

    @Column(name = "onset_time")
    private LocalDateTime onsetTime;

    @Column(name = "severity_level")
    @Enumerated(EnumType.STRING)
    private SeverityLevel severityLevel;

    @Column(name = "vital_signs_stable")
    private Boolean vitalSignsStable;

    @Column(name = "consciousness_level")
    private String consciousnessLevel;

    @Column(name = "pain_level")
    private Integer painLevel; // 1-10 scale

    @Column(name = "allergies")
    private String allergies;

    @Column(name = "current_medications")
    private String currentMedications;

    @Column(name = "immediate_action_taken", columnDefinition = "TEXT")
    private String immediateActionTaken;

    @Column(name = "requires_immediate_surgery")
    private Boolean requiresImmediateSurgery = false;

    @Column(name = "requires_transfer")
    private Boolean requiresTransfer = false;

    @Column(name = "transfer_hospital")
    private String transferHospital;

    @Column(name = "transfer_reason", columnDefinition = "TEXT")
    private String transferReason;

    @Column(name = "emergency_notes", columnDefinition = "TEXT")
    private String emergencyNotes;

    @Column(name = "attended_by")
    private String attendedBy;

    @Column(name = "arrival_time")
    private LocalDateTime arrivalTime;

    @Column(name = "treatment_start_time")
    private LocalDateTime treatmentStartTime;

    @Column(name = "stabilized_time")
    private LocalDateTime stabilizedTime;

    public enum EmergencyType {
        EYE_TRAUMA,           // Eye injury or trauma
        SUDDEN_VISION_LOSS,   // Sudden loss of vision
        SEVERE_PAIN,          // Severe eye pain
        INFECTION,            // Eye infection
        BLEEDING,             // Eye bleeding
        CHEMICAL_EXPOSURE,    // Chemical exposure to eyes
        FOREIGN_BODY,         // Foreign body in eye
        ALLERGIC_REACTION,    // Allergic reaction affecting eyes
        OTHER                 // Other emergency
    }

    public enum PriorityLevel {
        CRITICAL,    // Immediate attention required
        HIGH,        // High priority
        MEDIUM,      // Medium priority
        LOW          // Low priority
    }

    public enum SeverityLevel {
        MILD,        // Mild symptoms
        MODERATE,    // Moderate symptoms
        SEVERE,      // Severe symptoms
        CRITICAL     // Critical condition
    }
} 