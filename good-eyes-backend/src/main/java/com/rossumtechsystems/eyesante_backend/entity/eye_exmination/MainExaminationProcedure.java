package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import com.rossumtechsystems.eyesante_backend.entity.Procedure;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "main_examination_procedures")
@Data
@EqualsAndHashCode(callSuper = true)
public class MainExaminationProcedure extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_examination_id", nullable = false)
    private MainExamination mainExamination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = false)
    private Procedure procedure;

    @Enumerated(EnumType.STRING)
    @Column(name = "eye_side", nullable = false)
    private EyeSide eyeSide;

    @Column(name = "status")
    private String status;

    @Column(name = "performed")
    private Boolean performed = false;

    public enum EyeSide {
        RIGHT, LEFT, BOTH
    }
} 