package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import com.rossumtechsystems.eyesante_backend.entity.Diagnosis;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "main_examination_diagnoses")
@Data
@EqualsAndHashCode(callSuper = true)
public class MainExaminationDiagnosis extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_examination_id", nullable = false)
    private MainExamination mainExamination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnosis_id", nullable = false)
    private Diagnosis diagnosis;

    @Enumerated(EnumType.STRING)
    @Column(name = "eye_side", nullable = false)
    private EyeSide eyeSide;

    public enum EyeSide {
        RIGHT, LEFT, BOTH
    }
} 