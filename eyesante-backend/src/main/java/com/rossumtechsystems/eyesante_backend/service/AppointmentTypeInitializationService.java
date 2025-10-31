package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.entity.AppointmentType;
import com.rossumtechsystems.eyesante_backend.repository.AppointmentTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

import java.math.BigDecimal;

// @Service
// @Transactional
public class AppointmentTypeInitializationService implements CommandLineRunner {

    @Autowired
    private AppointmentTypeRepository appointmentTypeRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultAppointmentTypes();
    }

    private void initializeDefaultAppointmentTypes() {
        // ROUTINE_EXAMINATION
        createAppointmentTypeIfNotExists("ROUTINE_EXAMINATION", 
            "Regular eye examination for vision assessment", 
            30, new BigDecimal("50000"), false, false, false, 30, 24);

        // FOLLOW_UP
        createAppointmentTypeIfNotExists("FOLLOW_UP", 
            "Follow-up examination for existing conditions", 
            45, new BigDecimal("75000"), true, false, true, 30, 24);

        // EMERGENCY
        createAppointmentTypeIfNotExists("EMERGENCY", 
            "Urgent eye care for immediate issues", 
            60, new BigDecimal("100000"), false, false, false, 1, 0);

        // SURGERY_CONSULTATION
        createAppointmentTypeIfNotExists("SURGERY_CONSULTATION", 
            "Consultation for surgical procedures", 
            60, new BigDecimal("120000"), true, true, true, 30, 48);

        // PRESCRIPTION_RENEWAL
        createAppointmentTypeIfNotExists("PRESCRIPTION_RENEWAL", 
            "Update glasses or contact lens prescription", 
            30, new BigDecimal("45000"), false, false, false, 30, 24);

        // DIAGNOSTIC_TEST
        createAppointmentTypeIfNotExists("DIAGNOSTIC_TEST", 
            "Specialized diagnostic testing", 
            45, new BigDecimal("80000"), true, false, true, 30, 24);

        // PRE_OPERATIVE_ASSESSMENT
        createAppointmentTypeIfNotExists("PRE_OPERATIVE_ASSESSMENT", 
            "Assessment before surgical procedures", 
            60, new BigDecimal("90000"), true, true, true, 30, 48);

        // POST_OPERATIVE_FOLLOW_UP
        createAppointmentTypeIfNotExists("POST_OPERATIVE_FOLLOW_UP", 
            "Follow-up after surgical procedures", 
            30, new BigDecimal("60000"), true, false, true, 30, 24);

        // VISION_THERAPY
        createAppointmentTypeIfNotExists("VISION_THERAPY", 
            "Vision therapy sessions", 
            45, new BigDecimal("70000"), true, false, true, 30, 24);

        // CONTACT_LENS_FITTING
        createAppointmentTypeIfNotExists("CONTACT_LENS_FITTING", 
            "Contact lens fitting and training", 
            30, new BigDecimal("60000"), false, false, false, 30, 24);

        // GLASSES_FITTING
        createAppointmentTypeIfNotExists("GLASSES_FITTING", 
            "Glasses fitting and adjustment", 
            20, new BigDecimal("25000"), false, false, false, 30, 24);

        // GLAUCOMA_SCREENING
        createAppointmentTypeIfNotExists("GLAUCOMA_SCREENING", 
            "Glaucoma screening and monitoring", 
            45, new BigDecimal("75000"), true, false, true, 30, 24);

        // CATARACT_EVALUATION
        createAppointmentTypeIfNotExists("CATARACT_EVALUATION", 
            "Cataract assessment and consultation", 
            45, new BigDecimal("85000"), true, false, true, 30, 24);

        // RETINAL_EXAMINATION
        createAppointmentTypeIfNotExists("RETINAL_EXAMINATION", 
            "Retinal examination and imaging", 
            45, new BigDecimal("90000"), true, false, true, 30, 24);

        // PEDIATRIC_EXAMINATION
        createAppointmentTypeIfNotExists("PEDIATRIC_EXAMINATION", 
            "Eye examination for children", 
            30, new BigDecimal("55000"), false, false, false, 30, 24);

        System.out.println("Default appointment types initialized successfully!");
    }

    private void createAppointmentTypeIfNotExists(String name, String description, 
                                                 Integer defaultDuration, BigDecimal defaultCost,
                                                 Boolean requiresInsurance, Boolean requiresPrepayment, 
                                                 Boolean requiresConsultation, Integer maxAdvanceBookingDays, 
                                                 Integer minNoticeHours) {
        
        if (!appointmentTypeRepository.existsByName(name)) {
            AppointmentType appointmentType = new AppointmentType();
            appointmentType.setName(name);
            appointmentType.setDescription(description);
            appointmentType.setDefaultDuration(defaultDuration);
            appointmentType.setDefaultCost(defaultCost);
            appointmentType.setRequiresInsurance(requiresInsurance);
            appointmentType.setRequiresPrepayment(requiresPrepayment);
            appointmentType.setRequiresConsultation(requiresConsultation);
            appointmentType.setMaxAdvanceBookingDays(maxAdvanceBookingDays);
            appointmentType.setMinNoticeHours(minNoticeHours);
            appointmentType.setIsActive(true);
            
            appointmentTypeRepository.save(appointmentType);
            System.out.println("Created appointment type: " + name);
        }
    }
} 