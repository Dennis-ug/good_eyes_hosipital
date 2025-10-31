package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import com.rossumtechsystems.eyesante_backend.entity.InventoryItem;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "main_examination_treatments")
@Data
@EqualsAndHashCode(callSuper = true)
public class MainExaminationTreatment extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_examination_id", nullable = false)
    private MainExamination mainExamination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "eye_side", nullable = false)
    private EyeSide eyeSide;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "duration")
    private String duration;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "dispensed")
    private Boolean dispensed = false;

    @Column(name = "instruction", columnDefinition = "TEXT")
    private String instruction;

    public enum EyeSide {
        RIGHT, LEFT, BOTH
    }
} 