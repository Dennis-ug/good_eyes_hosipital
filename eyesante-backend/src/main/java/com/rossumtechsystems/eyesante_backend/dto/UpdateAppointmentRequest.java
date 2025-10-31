package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.rossumtechsystems.eyesante_backend.entity.Appointment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class UpdateAppointmentRequest {
    // Allow partial updates; only non-null fields will be updated

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
    @JsonDeserialize(using = DateDeserializer.class)
    private LocalDate appointmentDate;

    @JsonDeserialize(using = TimeDeserializer.class)
    private LocalTime appointmentTime;

    private Integer duration;

    // Appointment Classification
    private Appointment.AppointmentType appointmentType;
    private String reason;
    private Appointment.AppointmentPriority priority;
    private String notes;

    // Follow-up Information
    private Boolean followUpRequired;
    @JsonDeserialize(using = DateDeserializer.class)
    private LocalDate followUpDate;

    // Insurance Information
    private String insuranceProvider;
    private String insuranceNumber;

    // Payment Information
    private BigDecimal cost;
    private Appointment.PaymentMethod paymentMethod;
}


