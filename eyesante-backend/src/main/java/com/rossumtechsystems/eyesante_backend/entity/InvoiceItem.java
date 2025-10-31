package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "invoice_items")
public class InvoiceItem extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Invoice Reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    // Item Information
    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    @Column(name = "item_type", nullable = false)
    private String itemType; // CONSULTATION, MEDICATION, PROCEDURE, LAB_TEST, etc.

    // Quantity and Pricing
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    // Discount Information
    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "final_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal finalPrice;

    // Tax Information
    @Column(name = "tax_percentage", precision = 5, scale = 2)
    private BigDecimal taxPercentage;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    // Insurance Coverage
    @Column(name = "insurance_covered")
    private Boolean insuranceCovered = false;

    @Column(name = "insurance_coverage_percentage", precision = 5, scale = 2)
    private BigDecimal insuranceCoveragePercentage;

    @Column(name = "insurance_amount", precision = 10, scale = 2)
    private BigDecimal insuranceAmount;

    // Notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Inventory Item Reference (for inventory-based invoice items)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    @Column(name = "sku")
    private String sku; // Stock Keeping Unit for inventory items

    // Constructors
    public InvoiceItem() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getFinalPrice() { return finalPrice; }
    public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }

    public BigDecimal getTaxPercentage() { return taxPercentage; }
    public void setTaxPercentage(BigDecimal taxPercentage) { this.taxPercentage = taxPercentage; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public Boolean getInsuranceCovered() { return insuranceCovered; }
    public void setInsuranceCovered(Boolean insuranceCovered) { this.insuranceCovered = insuranceCovered; }

    public BigDecimal getInsuranceCoveragePercentage() { return insuranceCoveragePercentage; }
    public void setInsuranceCoveragePercentage(BigDecimal insuranceCoveragePercentage) { this.insuranceCoveragePercentage = insuranceCoveragePercentage; }

    public BigDecimal getInsuranceAmount() { return insuranceAmount; }
    public void setInsuranceAmount(BigDecimal insuranceAmount) { this.insuranceAmount = insuranceAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public InventoryItem getInventoryItem() { return inventoryItem; }
    public void setInventoryItem(InventoryItem inventoryItem) { this.inventoryItem = inventoryItem; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    // Helper methods
    public void calculateTotals() {
        // Calculate total price
        this.totalPrice = this.unitPrice.multiply(new BigDecimal(this.quantity));

        // Calculate discount
        if (this.discountPercentage != null && this.discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            this.discountAmount = this.totalPrice.multiply(this.discountPercentage)
                    .divide(new BigDecimal("100"), RoundingMode.HALF_UP);
        } else {
            this.discountAmount = BigDecimal.ZERO;
        }

        // Calculate price after discount
        BigDecimal priceAfterDiscount = this.totalPrice.subtract(this.discountAmount);

        // Calculate tax
        if (this.taxPercentage != null && this.taxPercentage.compareTo(BigDecimal.ZERO) > 0) {
            this.taxAmount = priceAfterDiscount.multiply(this.taxPercentage)
                    .divide(new BigDecimal("100"), RoundingMode.HALF_UP);
        } else {
            this.taxAmount = BigDecimal.ZERO;
        }

        // Calculate final price
        this.finalPrice = priceAfterDiscount.add(this.taxAmount);

        // Calculate insurance amount
        if (this.insuranceCovered && this.insuranceCoveragePercentage != null) {
            this.insuranceAmount = this.finalPrice.multiply(this.insuranceCoveragePercentage)
                    .divide(new BigDecimal("100"), RoundingMode.HALF_UP);
        } else {
            this.insuranceAmount = BigDecimal.ZERO;
        }
    }

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        calculateTotals();
    }

    @PreUpdate
    @Override
    protected void onUpdate() {
        super.onUpdate();
        calculateTotals();
    }
} 