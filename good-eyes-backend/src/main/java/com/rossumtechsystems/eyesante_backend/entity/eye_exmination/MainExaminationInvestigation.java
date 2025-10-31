package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import com.rossumtechsystems.eyesante_backend.entity.InvestigationType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "main_examination_investigations")
@Data
@EqualsAndHashCode(callSuper = true)
public class MainExaminationInvestigation extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_examination_id", nullable = false)
    private MainExamination mainExamination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investigation_type_id", nullable = false)
    private InvestigationType investigationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "eye_side", nullable = false)
    private EyeSide eyeSide;

    @Column(name = "value")
    private String value;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    public enum EyeSide {
        RIGHT, LEFT, BOTH
    }
} 