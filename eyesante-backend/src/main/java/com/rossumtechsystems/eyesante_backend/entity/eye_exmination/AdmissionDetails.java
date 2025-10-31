package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import com.rossumtechsystems.eyesante_backend.entity.Ward;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "admission_details")
@Data
@EqualsAndHashCode(callSuper = true)
public class AdmissionDetails extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_examination_id", nullable = false)
    private MainExamination mainExamination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @Column(name = "admitted_on", nullable = false)
    private LocalDateTime admittedOn;
} 