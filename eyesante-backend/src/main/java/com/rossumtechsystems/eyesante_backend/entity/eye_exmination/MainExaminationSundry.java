package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import com.rossumtechsystems.eyesante_backend.entity.Sundry;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "main_examination_sundries")
@Data
@EqualsAndHashCode(callSuper = true)
public class MainExaminationSundry extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_examination_id", nullable = false)
    private MainExamination mainExamination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sundry_id", nullable = false)
    private Sundry sundry;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;
} 