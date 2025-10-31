package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientVisitSessionRequest {
    private Long patientId;
    private String visitPurpose;
    private String currentStage;
    private String chiefComplaint;
    private Boolean requiresTriage;
    private Boolean requiresDoctorVisit;
    private Boolean isEmergency;
    private Boolean consultationFeePaid;
    private Double consultationFeeAmount;
    private String paymentMethod;
    private String paymentReference;
    private Long previousVisitId;
    private String emergencyLevel;
    private String notes;
} 