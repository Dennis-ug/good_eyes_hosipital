package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.rossumtechsystems.eyesante_backend.entity.Appointment;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateAppointmentRequest {
    
    // Patient Information
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    @NotBlank(message = "Patient name is required")
    private String patientName;
    
    private String patientPhone;
    private String patientEmail;
    
    // Doctor Information
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    
    @NotBlank(message = "Doctor name is required")
    private String doctorName;
    
    private String doctorSpecialty;
    
    // Appointment Details
    @NotNull(message = "Appointment date is required")
    @JsonDeserialize(using = DateDeserializer.class)
    private LocalDate appointmentDate;
    
    @NotNull(message = "Appointment time is required")
    @JsonDeserialize(using = TimeDeserializer.class)
    private LocalTime appointmentTime;
    
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer duration = 30; // Default 30 minutes
    
    // Appointment Classification
    @NotNull(message = "Appointment type is required")
    private Appointment.AppointmentType appointmentType;
    
    private String reason;
    private Appointment.AppointmentPriority priority = Appointment.AppointmentPriority.NORMAL;
    private String notes;
    
    // Follow-up Information
    private Boolean followUpRequired = false;
    
    @JsonDeserialize(using = DateDeserializer.class)
    private LocalDate followUpDate;
    
    // Insurance Information
    private String insuranceProvider;
    private String insuranceNumber;
    
    // Payment Information
    private BigDecimal cost;
    private Appointment.PaymentMethod paymentMethod;
} 