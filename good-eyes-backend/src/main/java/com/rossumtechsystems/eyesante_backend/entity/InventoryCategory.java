package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "inventory_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InventoryCategory extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InventoryItem> items;
    
    // Predefined category types for consistency
    public enum CategoryType {
        DRUGS("Pharmaceutical medications and drugs"),
        EQUIPMENT("Medical equipment and devices"),
        SUPPLIES("Medical supplies and consumables"),
        EYEGLASSES("Eye glasses and frames"),
        SUNDRIES("Miscellaneous items"),
        SURGICAL("Surgical instruments and supplies"),
        DIAGNOSTIC("Diagnostic tools and equipment");
        
        private final String description;
        
        CategoryType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
} 