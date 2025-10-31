package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EyeExaminationDto {
    private Long id;
    private Long patientId;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime examinationDate;
    
    private Long examinerId;
    private String examinerName;
    private String chiefComplaint;
    private String visualAcuityRight;
    private String visualAcuityLeft;
    private Double intraocularPressureRight;
    private Double intraocularPressureLeft;
    private String refractionRight;
    private String refractionLeft;
    private String diagnosis;
    private String treatmentPlan;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate nextAppointment;
    
    private String eyeHistory;
    private String familyEyeHistory;
    private String notes;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
} 