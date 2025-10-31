package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@org.hibernate.annotations.Where(clause = "deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Appointment extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Patient Information
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_phone")
    private String patientPhone;

    @Column(name = "patient_email")
    private String patientEmail;

    // Doctor Information
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "doctor_specialty")
    private String doctorSpecialty;

    // Appointment Details
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "duration", nullable = false)
    private Integer duration; // Duration in minutes

    // Appointment Classification
    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_type", nullable = false)
    private AppointmentType appointmentType;

    @Column(name = "reason")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private AppointmentPriority priority = AppointmentPriority.NORMAL;

    @Column(name = "notes")
    private String notes;

    // Status Management
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    // Cancellation Information
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    // Reminder Information
    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;

    // Check-in/Check-out Information
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "actual_duration")
    private Integer actualDuration; // Actual duration in minutes

    // Follow-up Information
    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    // Insurance Information
    @Column(name = "insurance_provider")
    private String insuranceProvider;

    @Column(name = "insurance_number")
    private String insuranceNumber;

    // Payment Information
    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    // Soft delete fields
    @Column(name = "deleted", nullable = false)
    private Boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    // Enums
    public enum AppointmentType {
        ROUTINE_EXAMINATION, FOLLOW_UP, EMERGENCY, SURGERY_CONSULTATION,
        PRESCRIPTION_RENEWAL, DIAGNOSTIC_TEST, PRE_OPERATIVE_ASSESSMENT,
        POST_OPERATIVE_FOLLOW_UP, VISION_THERAPY, CONTACT_LENS_FITTING,
        GLASSES_FITTING, GLAUCOMA_SCREENING, CATARACT_EVALUATION,
        RETINAL_EXAMINATION, PEDIATRIC_EXAMINATION
    }

    public enum AppointmentPriority {
        LOW, NORMAL, HIGH, URGENT, EMERGENCY
    }

    public enum AppointmentStatus {
        SCHEDULED, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, 
        CANCELLED, NO_SHOW, RESCHEDULED, WAITING, READY
    }

    public enum PaymentStatus {
        PENDING, PAID, PARTIAL, REFUNDED
    }

    public enum PaymentMethod {
        CASH, MOBILE_MONEY, BANK_TRANSFER, CARD, INSURANCE
    }

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        if (endTime == null && appointmentTime != null && duration != null) {
            endTime = appointmentTime.plusMinutes(duration);
        }
    }

    @PreUpdate
    @Override
    protected void onUpdate() {
        super.onUpdate();
        if (endTime == null && appointmentTime != null && duration != null) {
            endTime = appointmentTime.plusMinutes(duration);
        }
    }
} 