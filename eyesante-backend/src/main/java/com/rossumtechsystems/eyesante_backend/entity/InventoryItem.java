package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InventoryItem extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "sku", unique = true)
    private String sku;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "quantity_in_stock", nullable = false)
    private Integer quantityInStock = 0;

    @Column(name = "minimum_stock_level")
    private Integer minimumStockLevel = 0;

    @Column(name = "maximum_stock_level")
    private Integer maximumStockLevel;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private InventoryCategory category;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "supplier_contact")
    private String supplierContact;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "reorder_quantity")
    private Integer reorderQuantity;
    
    // Drug-specific fields for pharmaceutical items
    @Column(name = "generic_name")
    private String genericName;
    
    @Column(name = "dosage_form")
    private String dosageForm;
    
    @Column(name = "strength")
    private String strength;
    
    @Column(name = "active_ingredient")
    private String activeIngredient;
    
    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;
    
    @Column(name = "batch_number")
    private String batchNumber;
    
    @Column(name = "requires_prescription")
    private Boolean requiresPrescription = false;
    
    @Column(name = "controlled_substance")
    private Boolean controlledSubstance = false;
    
    @Column(name = "storage_conditions")
    private String storageConditions;

    // Optics-specific fields for frames only (lenses are generated dynamically)
    @Column(name = "optics_type")
    private String opticsType; // FRAME, ACCESSORY (LENSES are generated dynamically)

    @Column(name = "frame_shape")
    private String frameShape; // Round, Square, Rectangular, Oval, etc.

    @Column(name = "frame_size")
    private String frameSize; // Bridge-Temple format (e.g., "52-18-140")

    @Column(name = "frame_material")
    private String frameMaterial; // Metal, Plastic, Titanium, etc.

    @Column(name = "brand")
    private String brand; // Brand name

    @Column(name = "model")
    private String model; // Model name or number

    @Column(name = "color")
    private String color; // Color description
} 