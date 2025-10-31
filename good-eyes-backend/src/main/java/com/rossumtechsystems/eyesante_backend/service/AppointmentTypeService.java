package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.entity.AppointmentType;
import com.rossumtechsystems.eyesante_backend.repository.AppointmentTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class AppointmentTypeService {

    @Autowired
    private AppointmentTypeRepository appointmentTypeRepository;

    public AppointmentType createAppointmentType(AppointmentType appointmentType) {
        // Check if name already exists
        if (appointmentTypeRepository.existsByName(appointmentType.getName())) {
            throw new RuntimeException("Appointment type with this name already exists");
        }

        // Validate required fields
        validateAppointmentType(appointmentType);

        return appointmentTypeRepository.save(appointmentType);
    }

    public AppointmentType updateAppointmentType(Long id, AppointmentType updatedAppointmentType) {
        AppointmentType existingAppointmentType = appointmentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment type not found with ID: " + id));

        // Check if name is being changed and if it conflicts with existing name
        if (!existingAppointmentType.getName().equals(updatedAppointmentType.getName()) &&
                appointmentTypeRepository.existsByName(updatedAppointmentType.getName())) {
            throw new RuntimeException("Appointment type with this name already exists");
        }

        // Validate required fields
        validateAppointmentType(updatedAppointmentType);

        // Update fields
        existingAppointmentType.setName(updatedAppointmentType.getName());
        existingAppointmentType.setDescription(updatedAppointmentType.getDescription());
        existingAppointmentType.setDefaultDuration(updatedAppointmentType.getDefaultDuration());
        existingAppointmentType.setDefaultCost(updatedAppointmentType.getDefaultCost());
        existingAppointmentType.setRequiresInsurance(updatedAppointmentType.getRequiresInsurance());
        existingAppointmentType.setRequiresPrepayment(updatedAppointmentType.getRequiresPrepayment());
        existingAppointmentType.setRequiresConsultation(updatedAppointmentType.getRequiresConsultation());
        existingAppointmentType.setMaxAdvanceBookingDays(updatedAppointmentType.getMaxAdvanceBookingDays());
        existingAppointmentType.setMinNoticeHours(updatedAppointmentType.getMinNoticeHours());
        existingAppointmentType.setIsActive(updatedAppointmentType.getIsActive());

        return appointmentTypeRepository.save(existingAppointmentType);
    }

    public void deleteAppointmentType(Long id) {
        AppointmentType appointmentType = appointmentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment type not found with ID: " + id));
        appointmentTypeRepository.delete(appointmentType);
    }

    public AppointmentType getAppointmentTypeById(Long id) {
        return appointmentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment type not found with ID: " + id));
    }

    public AppointmentType getAppointmentTypeByName(String name) {
        return appointmentTypeRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Appointment type not found with name: " + name));
    }

    public List<AppointmentType> getAllActiveAppointmentTypes() {
        return appointmentTypeRepository.findByIsActiveTrueOrderByName();
    }

    public List<AppointmentType> getAllAppointmentTypes() {
        return appointmentTypeRepository.findAll();
    }

    public List<AppointmentType> getAppointmentTypesByActiveStatus(Boolean isActive) {
        return appointmentTypeRepository.findByIsActiveOrderByName(isActive);
    }

    public List<AppointmentType> searchAppointmentTypesByName(String name) {
        return appointmentTypeRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }

    public List<AppointmentType> getAppointmentTypesByInsuranceRequirement(Boolean requiresInsurance) {
        return appointmentTypeRepository.findByRequiresInsuranceAndIsActiveTrue(requiresInsurance);
    }

    public List<AppointmentType> getAppointmentTypesByPrepaymentRequirement(Boolean requiresPrepayment) {
        return appointmentTypeRepository.findByRequiresPrepaymentAndIsActiveTrue(requiresPrepayment);
    }

    public List<AppointmentType> getAppointmentTypesByConsultationRequirement(Boolean requiresConsultation) {
        return appointmentTypeRepository.findByRequiresConsultationAndIsActiveTrue(requiresConsultation);
    }

    public void toggleAppointmentTypeStatus(Long id) {
        AppointmentType appointmentType = appointmentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment type not found with ID: " + id));
        
        appointmentType.setIsActive(!appointmentType.getIsActive());
        appointmentTypeRepository.save(appointmentType);
    }

    public boolean existsByName(String name) {
        return appointmentTypeRepository.existsByName(name);
    }

    private void validateAppointmentType(AppointmentType appointmentType) {
        if (appointmentType.getName() == null || appointmentType.getName().trim().isEmpty()) {
            throw new RuntimeException("Appointment type name is required");
        }

        if (appointmentType.getDescription() == null || appointmentType.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Appointment type description is required");
        }

        if (appointmentType.getDefaultDuration() == null || appointmentType.getDefaultDuration() <= 0) {
            throw new RuntimeException("Default duration must be greater than 0");
        }

        if (appointmentType.getDefaultDuration() > 480) {
            throw new RuntimeException("Default duration cannot exceed 480 minutes (8 hours)");
        }

        if (appointmentType.getDefaultCost() == null || appointmentType.getDefaultCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Default cost must be non-negative");
        }

        if (appointmentType.getMaxAdvanceBookingDays() != null && 
            (appointmentType.getMaxAdvanceBookingDays() < 0 || appointmentType.getMaxAdvanceBookingDays() > 365)) {
            throw new RuntimeException("Max advance booking days must be between 0 and 365");
        }

        if (appointmentType.getMinNoticeHours() != null && 
            (appointmentType.getMinNoticeHours() < 0 || appointmentType.getMinNoticeHours() > 168)) {
            throw new RuntimeException("Min notice hours must be between 0 and 168 (1 week)");
        }
    }
} 