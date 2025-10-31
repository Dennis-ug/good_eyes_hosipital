package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@EqualsAndHashCode(callSuper = true)
public class Review extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    @Column(name = "previous_visit_id")
    private Long previousVisitId; // Reference to visit being reviewed

    @Column(name = "review_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ReviewType reviewType;

    @Column(name = "treatment_compliance")
    private Boolean treatmentCompliance; // Whether patient followed treatment plan

    @Column(name = "symptom_improvement")
    private Boolean symptomImprovement; // Whether symptoms improved

    @Column(name = "side_effects_experienced")
    private String sideEffectsExperienced;

    @Column(name = "current_symptoms", columnDefinition = "TEXT")
    private String currentSymptoms;

    @Column(name = "treatment_effectiveness_rating")
    private Integer treatmentEffectivenessRating; // 1-5 scale

    @Column(name = "recommendation_changes")
    private Boolean recommendationChanges; // Whether treatment plan needs changes

    @Column(name = "new_recommendations", columnDefinition = "TEXT")
    private String newRecommendations;

    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    public enum ReviewType {
        TREATMENT_REVIEW,      // Review of ongoing treatment
        POST_SURGERY_REVIEW,   // Review after surgery
        MEDICATION_REVIEW,     // Review of medication effectiveness
        PROGRESS_REVIEW,       // General progress review
        COMPLAINT_REVIEW       // Review of specific complaint
    }
} 