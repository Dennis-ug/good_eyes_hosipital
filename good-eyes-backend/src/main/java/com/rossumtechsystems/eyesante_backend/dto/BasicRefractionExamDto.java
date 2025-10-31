package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.BasicRefractionExam;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// No timestamps in strict UI response

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BasicRefractionExamDto {
    private Long id;
    private Long visitSessionId;
    private Boolean neuroOriented;
    private String neuroMood;
    private Boolean pupilsPerrl;
    private String pupilsRightDark;
    private String pupilsRightLight;
    private String pupilsLeftDark;
    private String pupilsLeftLight;
    private String visualAcuityDistanceScRight;
    private String visualAcuityDistanceScLeft;
    private String visualAcuityDistanceCcRight;
    private String visualAcuityDistanceCcLeft;
    private String visualAcuityNearScRight;
    private String visualAcuityNearScLeft;
    private String visualAcuityNearCcRight;
    private String visualAcuityNearCcLeft;
    
    // Pinhole (ph) values supported by UI
    private String visualAcuityDistancePhRight;
    private String visualAcuityDistancePhLeft;
    
    private String pupilsRightShape;
    private String pupilsRightReact;
    private String pupilsRightApd;
    private String pupilsLeftShape;
    private String pupilsLeftReact;
    private String pupilsLeftApd;
    
    // No extra neuro/psych notes in UI
    
    // Keratometry fields (UI)
    private String keratometryK1Right;
    private String keratometryK2Right;
    private String keratometryAxisRight;
    private String keratometryK1Left;
    private String keratometryK2Left;
    private String keratometryAxisLeft;
    
    // Additional fields in UI
    private String addedValues;
    private String bestRightVision;
    private String bestLeftVision;
    private String pdRightEye;
    private String pdLeftEye;
    
    private String manifestAutoRightSphere;
    private String manifestAutoRightCylinder;
    private String manifestAutoRightAxis;
    private String manifestAutoLeftSphere;
    private String manifestAutoLeftCylinder;
    private String manifestAutoLeftAxis;
    private String manifestRetRightSphere;
    private String manifestRetRightCylinder;
    private String manifestRetRightAxis;
    private String manifestRetLeftSphere;
    private String manifestRetLeftCylinder;
    private String manifestRetLeftAxis;
    private String subjectiveRightSphere;
    private String subjectiveRightCylinder;
    private String subjectiveRightAxis;
    private String subjectiveLeftSphere;
    private String subjectiveLeftCylinder;
    private String subjectiveLeftAxis;
    private String comment;
    // No examination/audit/patient details in strict UI response

    // Constructor to convert from entity
    public BasicRefractionExamDto(BasicRefractionExam entity) {
        this.id = entity.getId();
        this.visitSessionId = entity.getVisitSession() != null ? entity.getVisitSession().getId() : null;
        this.neuroOriented = entity.getNeuroOriented();
        this.neuroMood = entity.getNeuroMood();
        // no neuroPsychNotes in UI
        this.pupilsPerrl = entity.getPupilsPerrl();
        this.pupilsRightDark = entity.getPupilsRightDark();
        this.pupilsRightLight = entity.getPupilsRightLight();
        this.pupilsRightShape = entity.getPupilsRightShape();
        this.pupilsRightReact = entity.getPupilsRightReact();
        this.pupilsRightApd = entity.getPupilsRightApd();
        this.pupilsLeftDark = entity.getPupilsLeftDark();
        this.pupilsLeftLight = entity.getPupilsLeftLight();
        this.pupilsLeftShape = entity.getPupilsLeftShape();
        this.pupilsLeftReact = entity.getPupilsLeftReact();
        this.pupilsLeftApd = entity.getPupilsLeftApd();
        // no pupilsNotes in UI
        this.visualAcuityDistanceScRight = entity.getVisualAcuityDistanceScRight();
        this.visualAcuityDistanceScLeft = entity.getVisualAcuityDistanceScLeft();
        this.visualAcuityDistancePhRight = entity.getVisualAcuityDistancePhRight();
        this.visualAcuityDistancePhLeft = entity.getVisualAcuityDistancePhLeft();
        this.visualAcuityDistanceCcRight = entity.getVisualAcuityDistanceCcRight();
        this.visualAcuityDistanceCcLeft = entity.getVisualAcuityDistanceCcLeft();
        this.visualAcuityNearScRight = entity.getVisualAcuityNearScRight();
        this.visualAcuityNearScLeft = entity.getVisualAcuityNearScLeft();
        this.visualAcuityNearCcRight = entity.getVisualAcuityNearCcRight();
        this.visualAcuityNearCcLeft = entity.getVisualAcuityNearCcLeft();
        // no visualAcuityNotes in UI
        this.keratometryK1Right = entity.getKeratometryK1Right();
        this.keratometryK2Right = entity.getKeratometryK2Right();
        this.keratometryAxisRight = entity.getKeratometryAxisRight();
        this.keratometryK1Left = entity.getKeratometryK1Left();
        this.keratometryK2Left = entity.getKeratometryK2Left();
        this.keratometryAxisLeft = entity.getKeratometryAxisLeft();
        this.manifestAutoRightSphere = entity.getManifestAutoRightSphere();
        this.manifestAutoRightCylinder = entity.getManifestAutoRightCylinder();
        this.manifestAutoRightAxis = entity.getManifestAutoRightAxis();
        this.manifestAutoLeftSphere = entity.getManifestAutoLeftSphere();
        this.manifestAutoLeftCylinder = entity.getManifestAutoLeftCylinder();
        this.manifestAutoLeftAxis = entity.getManifestAutoLeftAxis();
        this.manifestRetRightSphere = entity.getManifestRetRightSphere();
        this.manifestRetRightCylinder = entity.getManifestRetRightCylinder();
        this.manifestRetRightAxis = entity.getManifestRetRightAxis();
        this.manifestRetLeftSphere = entity.getManifestRetLeftSphere();
        this.manifestRetLeftCylinder = entity.getManifestRetLeftCylinder();
        this.manifestRetLeftAxis = entity.getManifestRetLeftAxis();
        this.subjectiveRightSphere = entity.getSubjectiveRightSphere();
        this.subjectiveRightCylinder = entity.getSubjectiveRightCylinder();
        this.subjectiveRightAxis = entity.getSubjectiveRightAxis();
        this.subjectiveLeftSphere = entity.getSubjectiveLeftSphere();
        this.subjectiveLeftCylinder = entity.getSubjectiveLeftCylinder();
        this.subjectiveLeftAxis = entity.getSubjectiveLeftAxis();
        this.addedValues = entity.getAddedValues();
        this.bestRightVision = entity.getBestRightVision();
        this.bestLeftVision = entity.getBestLeftVision();
        this.pdRightEye = entity.getPdRightEye();
        this.pdLeftEye = entity.getPdLeftEye();
        // no refractionNotes in UI
        this.comment = entity.getComment();
    }
} 