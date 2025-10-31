package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "surgery_report_consumables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SurgeryReportConsumable extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surgery_report_id", nullable = false)
    private SurgeryReport surgeryReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumable_item_id", nullable = false)
    private ConsumableItem consumableItem;

    @Column(name = "quantity_used", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityUsed;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
