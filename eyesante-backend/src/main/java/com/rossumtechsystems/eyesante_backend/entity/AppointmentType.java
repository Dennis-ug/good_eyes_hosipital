package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "appointment_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AppointmentType extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Type Information
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    // Default Settings
    @Column(name = "default_duration", nullable = false)
    private Integer defaultDuration; // Default duration in minutes

    @Column(name = "default_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal defaultCost; // Default cost in Uganda Shillings

    // Requirements
    @Column(name = "requires_insurance")
    private Boolean requiresInsurance = false;

    @Column(name = "requires_prepayment")
    private Boolean requiresPrepayment = false;

    @Column(name = "requires_consultation")
    private Boolean requiresConsultation = false;

    // Scheduling Rules
    @Column(name = "max_advance_booking_days")
    private Integer maxAdvanceBookingDays = 30; // Maximum days in advance for booking

    @Column(name = "min_notice_hours")
    private Integer minNoticeHours = 24; // Minimum notice in hours for cancellation

    // Status
    @Column(name = "is_active")
    private Boolean isActive = true;
} 