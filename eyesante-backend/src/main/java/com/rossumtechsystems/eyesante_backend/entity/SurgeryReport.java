package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "surgery_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SurgeryReport extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_procedure_id", nullable = false)
    private PatientProcedure patientProcedure;

    @Enumerated(EnumType.STRING)
    @Column(name = "anesthesia_type", nullable = false)
    private AnesthesiaType anesthesiaType; // LOCAL or GENERAL

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis; // DX text

    @Enumerated(EnumType.STRING)
    @Column(name = "surgery_type", nullable = false)
    private SurgeryType surgeryType; // ELECTIVE or EMERGENCY

    @Enumerated(EnumType.STRING)
    @Column(name = "eye_side")
    private EyeSide eyeSide; // LEFT, RIGHT, BOTH

    @Column(name = "surgeon_name")
    private String surgeonName;

    @Column(name = "assistant_name")
    private String assistantName;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    // Consumable items used in this surgery
    @OneToMany(mappedBy = "surgeryReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SurgeryReportConsumable> consumableItems = new ArrayList<>();

    public enum AnesthesiaType {
        LOCAL, GENERAL
    }

    public enum SurgeryType {
        ELECTIVE, EMERGENCY
    }

    public enum EyeSide {
        LEFT, RIGHT, BOTH
    }
}


