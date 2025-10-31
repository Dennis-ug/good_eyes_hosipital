package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientVisitSessionDto {
    private Long id;
    private Long patientId;
    private String patientNumber;
    private String patientName;
    private LocalDateTime visitDate;
    private String visitPurpose;
    private String status;
    private String currentStage;
    private Boolean consultationFeePaid;
    private Double consultationFeeAmount;
    private String paymentMethod;
    private String paymentReference;
    private String chiefComplaint;
    private Long previousVisitId;
    private String emergencyLevel;
    private Boolean requiresTriage;
    private Boolean requiresDoctorVisit;
    private Boolean isEmergency;
    private String notes;
    private Long invoiceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    // Constructor to convert from entity
    public PatientVisitSessionDto(PatientVisitSession entity) {
        this.id = entity.getId();
        
        // Safely handle patient relationship
        if (entity.getPatient() != null) {
            this.patientId = entity.getPatient().getId();
            this.patientNumber = entity.getPatient().getPatientNumber();
            String firstName = entity.getPatient().getFirstName();
            String lastName = entity.getPatient().getLastName();
            this.patientName = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "").trim();
        } else {
            this.patientId = null;
            this.patientNumber = null;
            this.patientName = "Unknown Patient";
        }
        
        this.visitDate = entity.getVisitDate();
        this.visitPurpose = entity.getVisitPurpose() != null ? entity.getVisitPurpose().name() : null;
        this.status = entity.getStatus() != null ? entity.getStatus().name() : null;
        this.currentStage = entity.getCurrentStage() != null ? entity.getCurrentStage().name() : null;
        this.consultationFeePaid = entity.getConsultationFeePaid();
        this.consultationFeeAmount = entity.getConsultationFeeAmount() != null ? entity.getConsultationFeeAmount().doubleValue() : null;
        this.paymentMethod = entity.getPaymentMethod() != null ? entity.getPaymentMethod().name() : null;
        this.paymentReference = entity.getPaymentReference();
        this.chiefComplaint = entity.getChiefComplaint();
        this.previousVisitId = entity.getPreviousVisitId();
        this.emergencyLevel = entity.getEmergencyLevel() != null ? entity.getEmergencyLevel().name() : null;
        this.requiresTriage = entity.getRequiresTriage();
        this.requiresDoctorVisit = entity.getRequiresDoctorVisit();
        this.isEmergency = entity.getIsEmergency();
        this.notes = entity.getNotes();
        this.invoiceId = entity.getInvoice() != null ? entity.getInvoice().getId() : null;
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
        this.createdBy = entity.getCreatedBy();
        this.updatedBy = entity.getUpdatedBy();
    }
} 