package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_recommendations")
@Data
@EqualsAndHashCode(callSuper = true)
public class DoctorRecommendation extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    @Column(name = "recommendation_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private RecommendationType recommendationType;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "treatment_plan", columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(name = "medications", columnDefinition = "TEXT")
    private String medications;

    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "follow_up_notes", columnDefinition = "TEXT")
    private String followUpNotes;

    @Column(name = "referral_required")
    private Boolean referralRequired = false;

    @Column(name = "referral_to")
    private String referralTo;

    @Column(name = "referral_reason", columnDefinition = "TEXT")
    private String referralReason;

    @Column(name = "surgery_required")
    private Boolean surgeryRequired = false;

    @Column(name = "surgery_type")
    private String surgeryType;

    @Column(name = "surgery_notes", columnDefinition = "TEXT")
    private String surgeryNotes;

    @Column(name = "lifestyle_recommendations", columnDefinition = "TEXT")
    private String lifestyleRecommendations;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @Column(name = "recommended_by")
    private String recommendedBy;

    @Column(name = "recommendation_date")
    private LocalDateTime recommendationDate;

    public enum RecommendationType {
        MEDICATION_ONLY,
        FOLLOW_UP,
        REFERRAL,
        SURGERY,
        LIFESTYLE_CHANGES,
        COMBINATION
    }
} 