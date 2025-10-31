package com.rossumtechsystems.eyesante_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "patients")
@EqualsAndHashCode(callSuper = true)
public class Patient extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_number", unique = true, length = 20)
    private String patientNumber;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "gender", nullable = false)
    private String gender; // "Male" or "Female"

    @Column(name = "national_id", length = 15)
    private String nationalId;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "age_in_years")
    private Integer ageInYears;

    @Column(name = "age_in_months")
    private Integer ageInMonths;

    @Column(name = "marital_status")
    private String maritalStatus;



    @Column(name = "occupation")
    private String occupation;

    @Column(name = "next_of_kin")
    private String nextOfKin;

    @Column(name = "next_of_kin_relationship")
    private String nextOfKinRelationship;

    @Column(name = "next_of_kin_phone")
    private String nextOfKinPhone;

    @Column(name = "phone")
    private String phone;

    @Column(name = "alternative_phone")
    private String alternativePhone;

    @Column(name = "phone_owner")
    private String phoneOwner;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "patient_category")
    private String patientCategory;

    @Column(name = "company")
    private String company;

    @Column(name = "preferred_language")
    private String preferredLanguage;

    @Column(name = "citizenship")
    private String citizenship;

    @Column(name = "country_id")
    private String countryId;

    @Column(name = "foreigner_or_refugee")
    private String foreignerOrRefugee;

    @Column(name = "non_ugandan_national_id_no")
    private String nonUgandanNationalIdNo;

    @Column(name = "residence")
    private String residence;

    @Column(name = "research_number")
    private String researchNumber;

    @Column(name = "reception_timestamp")
    private LocalDateTime receptionTimestamp;

    @Column(name = "received_by")
    private String receivedBy;

    @Column(name = "deleted", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean deleted = false;

    // Relationship to eye examinations
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EyeExamination> eyeExaminations = new ArrayList<>();
    
    // Relationship to patient visit sessions
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PatientVisitSession> patientVisitSessions = new ArrayList<>();
} 