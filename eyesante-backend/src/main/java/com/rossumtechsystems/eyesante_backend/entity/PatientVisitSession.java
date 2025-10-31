package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.BasicRefractionExam;
import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.MainExamination;

@Data
@Entity
@Table(name = "patient_visit_sessions")
@EqualsAndHashCode(callSuper = true)
public class PatientVisitSession extends BaseAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "visit_purpose", nullable = false)
    private VisitPurpose visitPurpose;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VisitStatus status = VisitStatus.REGISTERED;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", nullable = false)
    private VisitStage currentStage = VisitStage.RECEPTION;
    
    @Column(name = "consultation_fee_paid")
    private Boolean consultationFeePaid = false;
    
    @Column(name = "consultation_fee_amount", precision = 10, scale = 2)
    private BigDecimal consultationFeeAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    // Visit-specific fields
    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;
    
    @Column(name = "previous_visit_id")
    private Long previousVisitId; // Reference to previous visit if applicable
    
    @Column(name = "emergency_level")
    @Enumerated(EnumType.STRING)
    private EmergencyLevel emergencyLevel;
    
    @Column(name = "requires_triage")
    private Boolean requiresTriage = true;
    
    @Column(name = "requires_doctor_visit")
    private Boolean requiresDoctorVisit = true;
    
    @Column(name = "is_emergency")
    private Boolean isEmergency = false;
    
    // Invoice Reference
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;
    
    // Examination Relationships
    @OneToOne(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private BasicRefractionExam basicRefractionExam;
    
    @OneToOne(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private MainExamination mainExamination;
    
    @OneToOne(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private TriageMeasurement triageMeasurement;
    
    @OneToOne(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private DoctorRecommendation doctorRecommendation;
    
    // Additional visit type specific entities
    @OneToOne(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private MedicationRefill medicationRefill;
    
    @OneToOne(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private Review review;
    
    @OneToOne(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private Emergency emergency;
    
    // Patient Diagnoses
    @OneToMany(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PatientDiagnosis> patientDiagnoses = new ArrayList<>();
    
    // Patient Procedures
    @OneToMany(mappedBy = "visitSession", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PatientProcedure> patientProcedures = new ArrayList<>();
    
    public enum VisitPurpose {
        NEW_CONSULTATION,    // New patient consultation
        FOLLOW_UP,           // Scheduled follow-up visit
        MEDICATION_REFILL,   // Coming to pick remaining medication
        REVIEW,              // Review of previous treatment
        EMERGENCY,           // Emergency visit
        SURGERY,             // Surgery visit
        ROUTINE_CHECKUP,     // Routine health checkup
        COMPLAINT_VISIT      // Patient with specific complaint
    }
    
    public enum VisitStatus {
        REGISTERED,               // Patient registered
        FREE,                     // Free consultation (no fee required)
        INVOICE_CREATED,          // Invoice created (for paid services)
        PAYMENT_PENDING,          // Waiting for payment
        PAYMENT_COMPLETED,        // Payment received
        TRIAGE_COMPLETED,         // Triage measurements done
        BASIC_REFRACTION_COMPLETED, // Basic refraction examination completed
        DOCTOR_VISIT_COMPLETED,   // Doctor examination completed
        MEDICATION_DISPENSED,     // Medication given to patient
        COMPLETED,                // Visit fully completed
        CANCELLED,                // Visit cancelled
        NO_SHOW                   // Patient didn't show up
    }
    
    // Import PaymentMethod from Invoice entity
    public enum PaymentMethod {
        CASH, MOBILE_MONEY, BANK_TRANSFER, CARD, INSURANCE, CHEQUE
    }
    
    public enum EmergencyLevel {
        NONE, LOW, MEDIUM, HIGH, CRITICAL
    }
    
    public enum VisitStage {
        RECEPTION,              // Patient registered at reception
        CASHIER,                // Patient sent to cashier for payment
        TRIAGE,                 // Patient sent to triage for measurements
        BASIC_REFRACTION_EXAM,  // Patient sent for basic refraction examination
        DOCTOR_VISIT,           // Patient with doctor for examination
        PHARMACY,               // Patient sent to pharmacy for medication
        COMPLETED               // Visit fully completed
    }
    
    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        // visitDate is now set in the service layer using TimeService for proper EAT timezone
    }
    
    @PreUpdate
    @Override
    protected void onUpdate() {
        super.onUpdate();
    }
} 