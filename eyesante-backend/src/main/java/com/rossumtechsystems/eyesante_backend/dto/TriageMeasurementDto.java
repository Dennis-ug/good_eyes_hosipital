package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.TriageMeasurement;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TriageMeasurementDto {
    private Long id;
    private Long visitSessionId;
    private Integer systolicBp;
    private Integer diastolicBp;
    private Double rbsValue;
    private String rbsUnit;
    private Integer iopRight;
    private Integer iopLeft;
    private Double weightKg;
    private Double weightLbs;
    private String notes;
    private String measuredBy;
    private LocalDateTime measurementDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    // Patient details
    private String patientName;
    private String patientPhone;

    // Constructor to convert from entity
    public TriageMeasurementDto(TriageMeasurement entity) {
        this.id = entity.getId();
        
        // Safely handle visit session relationship
        try {
            this.visitSessionId = entity.getVisitSession() != null ? entity.getVisitSession().getId() : null;
        } catch (Exception e) {
            this.visitSessionId = null;
        }
        
        this.systolicBp = entity.getSystolicBp();
        this.diastolicBp = entity.getDiastolicBp();
        this.rbsValue = entity.getRbsValue() != null ? entity.getRbsValue().doubleValue() : null;
        this.rbsUnit = entity.getRbsUnit();
        this.iopRight = entity.getIopRight();
        this.iopLeft = entity.getIopLeft();
        this.weightKg = entity.getWeightKg() != null ? entity.getWeightKg().doubleValue() : null;
        this.weightLbs = entity.getWeightLbs() != null ? entity.getWeightLbs().doubleValue() : null;
        this.notes = entity.getNotes();
        this.measuredBy = entity.getMeasuredBy();
        this.measurementDate = entity.getMeasurementDate();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
        this.createdBy = entity.getCreatedBy();
        this.updatedBy = entity.getUpdatedBy();
        
        // Safely set patient details from visit session
        try {
            if (entity.getVisitSession() != null && entity.getVisitSession().getPatient() != null) {
                var patient = entity.getVisitSession().getPatient();
                String firstName = patient.getFirstName() != null ? patient.getFirstName() : "";
                String lastName = patient.getLastName() != null ? patient.getLastName() : "";
                this.patientName = (firstName + " " + lastName).trim();
                this.patientPhone = patient.getPhone();
            }
        } catch (Exception e) {
            this.patientName = "Unknown Patient";
            this.patientPhone = null;
        }
    }
} 