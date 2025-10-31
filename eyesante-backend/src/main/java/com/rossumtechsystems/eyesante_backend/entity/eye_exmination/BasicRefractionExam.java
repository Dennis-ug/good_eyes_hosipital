package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "basic_refraction_exams")
public class BasicRefractionExam extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession visitSession;
    
    // Neuro/Psych Section
    @Column(name = "neuro_oriented")
    private Boolean neuroOriented; // Oriented x3 checkbox
    
    @Column(name = "neuro_mood")
    private String neuroMood; // Mood/Affect text
    
    // UI does not require neuro/psych notes text field
    
    // Pupils Section
    @Column(name = "pupils_perrl")
    private Boolean pupilsPerrl; // PERRL checkbox
    
    // Right Eye Pupils
    @Column(name = "pupils_right_dark")
    private String pupilsRightDark;
    
    @Column(name = "pupils_right_light")
    private String pupilsRightLight;
    
    @Column(name = "pupils_right_shape")
    private String pupilsRightShape;
    
    @Column(name = "pupils_right_react")
    private String pupilsRightReact;
    
    @Column(name = "pupils_right_apd")
    private String pupilsRightApd;
    
    // Left Eye Pupils
    @Column(name = "pupils_left_dark")
    private String pupilsLeftDark;
    
    @Column(name = "pupils_left_light")
    private String pupilsLeftLight;
    
    @Column(name = "pupils_left_shape")
    private String pupilsLeftShape;
    
    @Column(name = "pupils_left_react")
    private String pupilsLeftReact;
    
    @Column(name = "pupils_left_apd")
    private String pupilsLeftApd;
    
    // UI does not require pupils notes field
    
    // Visual Acuity Section
    // Distance - Right Eye
    @Column(name = "visual_acuity_distance_sc_right")
    private String visualAcuityDistanceScRight;
    
    @Column(name = "visual_acuity_distance_ph_right")
    private String visualAcuityDistancePhRight;
    
    @Column(name = "visual_acuity_distance_cc_right")
    private String visualAcuityDistanceCcRight;
    
    // Distance - Left Eye
    @Column(name = "visual_acuity_distance_sc_left")
    private String visualAcuityDistanceScLeft;
    
    @Column(name = "visual_acuity_distance_ph_left")
    private String visualAcuityDistancePhLeft;
    
    @Column(name = "visual_acuity_distance_cc_left")
    private String visualAcuityDistanceCcLeft;
    
    // Near - Right Eye
    @Column(name = "visual_acuity_near_sc_right")
    private String visualAcuityNearScRight;
    
    @Column(name = "visual_acuity_near_cc_right")
    private String visualAcuityNearCcRight;
    
    // Near - Left Eye
    @Column(name = "visual_acuity_near_sc_left")
    private String visualAcuityNearScLeft;
    
    @Column(name = "visual_acuity_near_cc_left")
    private String visualAcuityNearCcLeft;
    
    // UI does not require visual acuity notes field
    
    // Refraction Section
    // Autorefractor - Right Eye
    @Column(name = "manifest_auto_right_sphere")
    private String manifestAutoRightSphere;
    
    @Column(name = "manifest_auto_right_cylinder")
    private String manifestAutoRightCylinder;
    
    @Column(name = "manifest_auto_right_axis")
    private String manifestAutoRightAxis;
    
    // Autorefractor - Left Eye
    @Column(name = "manifest_auto_left_sphere")
    private String manifestAutoLeftSphere;
    
    @Column(name = "manifest_auto_left_cylinder")
    private String manifestAutoLeftCylinder;
    
    @Column(name = "manifest_auto_left_axis")
    private String manifestAutoLeftAxis;
    
    // Keratometry - Right Eye
    @Column(name = "keratometry_k1_right")
    private String keratometryK1Right;
    
    @Column(name = "keratometry_k2_right")
    private String keratometryK2Right;
    
    @Column(name = "keratometry_axis_right")
    private String keratometryAxisRight;
    
    // Keratometry - Left Eye
    @Column(name = "keratometry_k1_left")
    private String keratometryK1Left;
    
    @Column(name = "keratometry_k2_left")
    private String keratometryK2Left;
    
    @Column(name = "keratometry_axis_left")
    private String keratometryAxisLeft;
    
    // Retinoscope - Right Eye
    @Column(name = "manifest_ret_right_sphere")
    private String manifestRetRightSphere;
    
    @Column(name = "manifest_ret_right_cylinder")
    private String manifestRetRightCylinder;
    
    @Column(name = "manifest_ret_right_axis")
    private String manifestRetRightAxis;
    
    // Retinoscope - Left Eye
    @Column(name = "manifest_ret_left_sphere")
    private String manifestRetLeftSphere;
    
    @Column(name = "manifest_ret_left_cylinder")
    private String manifestRetLeftCylinder;
    
    @Column(name = "manifest_ret_left_axis")
    private String manifestRetLeftAxis;
    
    // Subjective - Right Eye
    @Column(name = "subjective_right_sphere")
    private String subjectiveRightSphere;
    
    @Column(name = "subjective_right_cylinder")
    private String subjectiveRightCylinder;
    
    @Column(name = "subjective_right_axis")
    private String subjectiveRightAxis;
    
    // Subjective - Left Eye
    @Column(name = "subjective_left_sphere")
    private String subjectiveLeftSphere;
    
    @Column(name = "subjective_left_cylinder")
    private String subjectiveLeftCylinder;
    
    @Column(name = "subjective_left_axis")
    private String subjectiveLeftAxis;
    
    // Additional Refraction Data
    @Column(name = "added_values")
    private String addedValues;
    
    @Column(name = "best_right_vision")
    private String bestRightVision;
    
    @Column(name = "best_left_vision")
    private String bestLeftVision;
    
    @Column(name = "pd_right_eye")
    private String pdRightEye;
    
    @Column(name = "pd_left_eye")
    private String pdLeftEye;
    
    // UI does not require refraction notes field
    
    // Comments
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
    
    // UI does not define explicit examination date or examinedBy fields
    
    // All additional measurements/features removed to strictly match UI
}
