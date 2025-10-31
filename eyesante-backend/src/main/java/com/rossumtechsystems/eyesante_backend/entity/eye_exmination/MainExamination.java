package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "main_examinations")
@Data
@EqualsAndHashCode(callSuper = true)
public class MainExamination extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_session_id", nullable = false)
    private PatientVisitSession visitSession;

    // External Examination
    @Column(name = "external_right", columnDefinition = "TEXT")
    private String externalRight;

    @Column(name = "external_left", columnDefinition = "TEXT")
    private String externalLeft;


    // Slit Lamp observations
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "main_exam_id", nullable = false)
    private List<SlitLampObservation> slitLampObservations = new java.util.ArrayList<>();

    // CDR (Cup-to-Disc Ratio)
    @Column(name = "cdr_right", precision = 4, scale = 2)
    private BigDecimal cdrRight;

    @Column(name = "cdr_left", precision = 4, scale = 2)
    private BigDecimal cdrLeft;

    // IOP (Intraocular Pressure)
    @Column(name = "iop_right", precision = 4, scale = 1)
    private java.math.BigDecimal iopRight;

    @Column(name = "iop_left", precision = 4, scale = 1)
    private java.math.BigDecimal iopLeft;

    // Notes and Comments
    @Column(name = "advice", columnDefinition = "TEXT")
    private String advice;

    @Column(name = "history_comments", columnDefinition = "TEXT")
    private String historyComments;

    @Column(name = "doctors_notes", columnDefinition = "TEXT")
    private String doctorsNotes;

    @Column(name = "time_completed")
    private LocalDateTime timeCompleted;
} 