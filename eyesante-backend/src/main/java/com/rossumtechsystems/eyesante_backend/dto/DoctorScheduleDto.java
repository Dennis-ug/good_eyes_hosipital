package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleDto {
    private Long id;
    
    // Doctor Information
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String doctorEmail;
    
    // Schedule Information
    private Integer dayOfWeek; // 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday
    private String dayName; // Monday, Tuesday, etc.
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    private LocalTime startTime;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    private LocalTime endTime;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    private LocalTime breakStart;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    private LocalTime breakEnd;
    
    // Availability
    private Boolean isAvailable;
    
    // Calculated fields
    private String scheduleTime; // e.g., "09:00 - 17:00"
    private String breakTime; // e.g., "12:00 - 13:00"
    private Integer totalWorkingHours; // in minutes
    
    // Audit Information
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String updatedBy;
} 