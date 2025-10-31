package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "eye_examinations")
@EqualsAndHashCode(callSuper = true)
public class EyeExamination extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "examination_date", nullable = false)
    private LocalDateTime examinationDate;

    @Column(name = "examiner_id")
    private Long examinerId;

    @Column(name = "examiner_name")
    private String examinerName;

    @Column(name = "chief_complaint")
    private String chiefComplaint;

    @Column(name = "visual_acuity_right")
    private String visualAcuityRight;

    @Column(name = "visual_acuity_left")
    private String visualAcuityLeft;

    @Column(name = "intraocular_pressure_right")
    private Double intraocularPressureRight;

    @Column(name = "intraocular_pressure_left")
    private Double intraocularPressureLeft;

    @Column(name = "refraction_right")
    private String refractionRight;

    @Column(name = "refraction_left")
    private String refractionLeft;

    @Column(name = "diagnosis")
    private String diagnosis;

    @Column(name = "treatment_plan")
    private String treatmentPlan;

    @Column(name = "next_appointment")
    private LocalDate nextAppointment;

    @Column(name = "eye_history")
    private String eyeHistory;

    @Column(name = "family_eye_history")
    private String familyEyeHistory;

    @Column(name = "notes")
    private String notes;

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (examinationDate == null) {
            examinationDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        super.onUpdate();
    }
} 