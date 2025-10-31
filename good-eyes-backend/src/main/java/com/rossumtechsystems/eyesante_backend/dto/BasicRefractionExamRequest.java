package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;

/**
 * DTO for Basic Refraction Exam form data
 * Matches the HTML form structure exactly
 */
@Data
public class BasicRefractionExamRequest {
    
    // Patient and Visit Session
    private Long patientId;
    private Long visitSessionId;
    
    // Neuro/Psych Section
    private Boolean neuroOriented; // Oriented x3 checkbox
    private String neuroMood; // Mood/Affect text
    
    // Pupils Section
    private Boolean pupilsPerrl; // PERRL checkbox
    
    // Right Eye Pupils
    private String pupilsRightDark;
    private String pupilsRightLight;
    private String pupilsRightShape;
    private String pupilsRightReact;
    private String pupilsRightApd;
    
    // Left Eye Pupils
    private String pupilsLeftDark;
    private String pupilsLeftLight;
    private String pupilsLeftShape;
    private String pupilsLeftReact;
    private String pupilsLeftApd;
    
    // Visual Acuity Section
    // Distance - Right Eye
    private String visualAcuityDistanceScRight;
    private String visualAcuityDistancePhRight;
    private String visualAcuityDistanceCcRight;
    
    // Distance - Left Eye
    private String visualAcuityDistanceScLeft;
    private String visualAcuityDistancePhLeft;
    private String visualAcuityDistanceCcLeft;
    
    // Near - Right Eye
    private String visualAcuityNearScRight;
    private String visualAcuityNearCcRight;
    
    // Near - Left Eye
    private String visualAcuityNearScLeft;
    private String visualAcuityNearCcLeft;
    
    // Refraction Section
    // Autorefractor - Right Eye
    private String manifestAutoRightSphere;
    private String manifestAutoRightCylinder;
    private String manifestAutoRightAxis;
    
    // Autorefractor - Left Eye
    private String manifestAutoLeftSphere;
    private String manifestAutoLeftCylinder;
    private String manifestAutoLeftAxis;
    
    // Keratometry - Right Eye
    private String keratometryK1Right;
    private String keratometryK2Right;
    private String keratometryAxisRight;
    
    // Keratometry - Left Eye
    private String keratometryK1Left;
    private String keratometryK2Left;
    private String keratometryAxisLeft;
    
    // Retinoscope - Right Eye
    private String manifestRetRightSphere;
    private String manifestRetRightCylinder;
    private String manifestRetRightAxis;
    
    // Retinoscope - Left Eye
    private String manifestRetLeftSphere;
    private String manifestRetLeftCylinder;
    private String manifestRetLeftAxis;
    
    // Subjective - Right Eye
    private String subjectiveRightSphere;
    private String subjectiveRightCylinder;
    private String subjectiveRightAxis;
    
    // Subjective - Left Eye
    private String subjectiveLeftSphere;
    private String subjectiveLeftCylinder;
    private String subjectiveLeftAxis;
    
    // Additional Refraction Data
    private String addedValues;
    private String bestRightVision;
    private String bestLeftVision;
    private String pdRightEye;
    private String pdLeftEye;
    
    // Comments
    private String comment;
} 