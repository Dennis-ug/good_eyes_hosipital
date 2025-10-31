package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PatientDto {
    private Long id;
    private String patientNumber;
    private String firstName;
    private String lastName;
    private String gender;
    private String nationalId;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    
    private Integer ageInYears;
    private Integer ageInMonths;
    private String maritalStatus;

    private String occupation;
    private String nextOfKin;
    private String nextOfKinRelationship;
    private String nextOfKinPhone;
    private String phone;
    private String alternativePhone;
    private String phoneOwner;
    private String ownerName;
    private String patientCategory;
    private String company;
    private String preferredLanguage;
    private String citizenship;
    private String countryId;
    private String foreignerOrRefugee;
    private String nonUgandanNationalIdNo;
    private String residence;
    private String researchNumber;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime receptionTimestamp;
    
    private String receivedBy;
    
    // Latest eye examination data (if available)
    private EyeExaminationDto latestEyeExamination;
} 