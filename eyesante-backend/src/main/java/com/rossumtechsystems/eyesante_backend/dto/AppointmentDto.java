package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rossumtechsystems.eyesante_backend.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {
    private Long id;
    
    // Patient Information
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;
    
    // Doctor Information
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    
    // Appointment Details
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime appointmentTime;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime endTime;
    
    private Integer duration; // Duration in minutes
    
    // Appointment Classification
    private Appointment.AppointmentType appointmentType;
    private String reason;
    private Appointment.AppointmentPriority priority;
    private String notes;
    
    // Status Management
    private Appointment.AppointmentStatus status;
    
    // Cancellation Information
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    private String cancellationReason;
    
    // Reminder Information
    private Boolean reminderSent;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reminderSentAt;
    
    // Check-in/Check-out Information
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime checkInTime;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime checkOutTime;
    
    private Integer actualDuration; // Actual duration in minutes
    
    // Follow-up Information
    private Boolean followUpRequired;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate followUpDate;
    
    // Insurance Information
    private String insuranceProvider;
    private String insuranceNumber;
    
    // Payment Information
    private BigDecimal cost;
    private Appointment.PaymentStatus paymentStatus;
    private Appointment.PaymentMethod paymentMethod;
    
    // Audit Information
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String updatedBy;
} 