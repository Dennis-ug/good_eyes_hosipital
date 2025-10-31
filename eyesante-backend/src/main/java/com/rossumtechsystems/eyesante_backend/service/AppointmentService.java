package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.AppointmentDto;
import com.rossumtechsystems.eyesante_backend.dto.CreateAppointmentRequest;
import com.rossumtechsystems.eyesante_backend.dto.UpdateAppointmentRequest;
import com.rossumtechsystems.eyesante_backend.entity.Appointment;
import com.rossumtechsystems.eyesante_backend.entity.AppointmentType;
import com.rossumtechsystems.eyesante_backend.entity.DoctorSchedule;
import com.rossumtechsystems.eyesante_backend.entity.Patient;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.AppointmentRepository;
import com.rossumtechsystems.eyesante_backend.repository.AppointmentTypeRepository;
import com.rossumtechsystems.eyesante_backend.repository.DoctorScheduleRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentTypeRepository appointmentTypeRepository;

    @Autowired
    private DoctorScheduleRepository doctorScheduleRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private FinanceService financeService;

    @Autowired
    private TimeService timeService;

    public AppointmentDto createAppointment(CreateAppointmentRequest request) {
        // Validate patient exists
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Validate doctor exists
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Get appointment type for default values
        String appointmentTypeName = request.getAppointmentType().name();
        AppointmentType appointmentType = appointmentTypeRepository.findByName(appointmentTypeName)
                .orElseThrow(() -> new RuntimeException("Appointment type not found: " + appointmentTypeName));

        // Check for scheduling conflicts
        LocalTime endTime = request.getAppointmentTime().plusMinutes(request.getDuration());
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                request.getDoctorId(), request.getAppointmentDate(), request.getAppointmentTime(), endTime);

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Appointment time conflicts with existing appointments");
        }

        // Check doctor availability
        String availabilityError = checkDoctorAvailability(request.getDoctorId(), request.getAppointmentDate(), request.getAppointmentTime(), endTime);
        if (availabilityError != null) {
            throw new RuntimeException(availabilityError);
        }

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setPatientName(request.getPatientName());
        appointment.setPatientPhone(request.getPatientPhone());
        appointment.setPatientEmail(request.getPatientEmail());
        appointment.setDoctor(doctor);
        appointment.setDoctorName(request.getDoctorName());
        appointment.setDoctorSpecialty(request.getDoctorSpecialty());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setEndTime(endTime);
        appointment.setDuration(request.getDuration());
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setReason(request.getReason());
        appointment.setPriority(request.getPriority());
        appointment.setNotes(request.getNotes());
        appointment.setFollowUpRequired(request.getFollowUpRequired());
        appointment.setFollowUpDate(request.getFollowUpDate());
        appointment.setInsuranceProvider(request.getInsuranceProvider());
        appointment.setInsuranceNumber(request.getInsuranceNumber());
        appointment.setCost(request.getCost() != null ? request.getCost() : appointmentType.getDefaultCost());
        appointment.setPaymentMethod(request.getPaymentMethod());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send confirmation email if patient email is provided
        if (request.getPatientEmail() != null) {
            try {
                emailService.sendAppointmentConfirmation(
                    request.getPatientEmail(),
                    request.getPatientName(),
                    request.getDoctorName(),
                    request.getAppointmentDate(),
                    request.getAppointmentTime(),
                    request.getAppointmentType().name()
                );
            } catch (Exception e) {
                // Log error but don't fail the appointment creation
                System.err.println("Failed to send appointment confirmation email: " + e.getMessage());
            }
        }

        return convertToDto(savedAppointment);
    }

    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return convertToDto(appointment);
    }

    public Page<AppointmentDto> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(this::convertToDto);
    }

    public Page<AppointmentDto> getAppointmentsByDoctor(Long doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorIdAndAppointmentDateOrderByAppointmentTime(doctorId, timeService.getCurrentDate(), pageable)
                .map(this::convertToDto);
    }

    public Page<AppointmentDto> getAppointmentsByPatient(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientIdAndAppointmentDateOrderByAppointmentTime(patientId, timeService.getCurrentDate(), pageable)
                .map(this::convertToDto);
    }

    public Page<AppointmentDto> getAppointmentsByStatus(Appointment.AppointmentStatus status, Pageable pageable) {
        return appointmentRepository.findByStatusOrderByAppointmentDateAscAppointmentTimeAsc(status, pageable)
                .map(this::convertToDto);
    }

    public Page<AppointmentDto> getAppointmentsByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return appointmentRepository.findByAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(startDate, endDate, pageable)
                .map(this::convertToDto);
    }

    public List<AppointmentDto> getTodayAppointments() {
        return appointmentRepository.findByAppointmentDateOrderByAppointmentTime(timeService.getCurrentDate())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto updateAppointmentStatus(Long appointmentId, Appointment.AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(newStatus);

        // Set check-in time if status is CHECKED_IN
        if (newStatus == Appointment.AppointmentStatus.CHECKED_IN) {
            appointment.setCheckInTime(timeService.getCurrentDateTime());
        }

        // Set check-out time if status is COMPLETED
        if (newStatus == Appointment.AppointmentStatus.COMPLETED) {
            appointment.setCheckOutTime(timeService.getCurrentDateTime());
            if (appointment.getCheckInTime() != null) {
                long actualDuration = ChronoUnit.MINUTES.between(appointment.getCheckInTime(), appointment.getCheckOutTime());
                appointment.setActualDuration((int) actualDuration);
            }
            
            // Automatically generate invoice when appointment is completed
            try {
                financeService.generateInvoiceForAppointment(appointmentId);
            } catch (Exception e) {
                // Log error but don't fail the appointment status update
                System.err.println("Failed to generate invoice for appointment " + appointmentId + ": " + e.getMessage());
            }
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return convertToDto(updatedAppointment);
    }

    public AppointmentDto cancelAppointment(Long appointmentId, String cancellationReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancelledAt(timeService.getCurrentDateTime());
        appointment.setCancelledBy("system"); // TODO: Get from security context
        appointment.setCancellationReason(cancellationReason);

        Appointment cancelledAppointment = appointmentRepository.save(appointment);
        return convertToDto(cancelledAppointment);
    }

    public AppointmentDto softDeleteAppointment(Long appointmentId, String deletedBy) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (Boolean.TRUE.equals(appointment.getDeleted())) {
            return convertToDto(appointment);
        }

        appointment.setDeleted(true);
        appointment.setDeletedAt(timeService.getCurrentDateTime());
        appointment.setDeletedBy(deletedBy != null ? deletedBy : "system");

        Appointment deletedAppointment = appointmentRepository.save(appointment);
        return convertToDto(deletedAppointment);
    }

    public AppointmentDto updateAppointment(Long appointmentId, UpdateAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Updating patient if provided
        if (request.getPatientId() != null) {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            appointment.setPatient(patient);
        }
        if (request.getPatientName() != null) appointment.setPatientName(request.getPatientName());
        if (request.getPatientPhone() != null) appointment.setPatientPhone(request.getPatientPhone());
        if (request.getPatientEmail() != null) appointment.setPatientEmail(request.getPatientEmail());

        // Updating doctor if provided
        if (request.getDoctorId() != null) {
            User doctor = userRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            appointment.setDoctor(doctor);
        }
        if (request.getDoctorName() != null) appointment.setDoctorName(request.getDoctorName());
        if (request.getDoctorSpecialty() != null) appointment.setDoctorSpecialty(request.getDoctorSpecialty());

        // Handle time/date/duration updates with conflict and schedule checks
        LocalDate newDate = request.getAppointmentDate() != null ? request.getAppointmentDate() : appointment.getAppointmentDate();
        LocalTime newTime = request.getAppointmentTime() != null ? request.getAppointmentTime() : appointment.getAppointmentTime();
        Integer newDuration = request.getDuration() != null ? request.getDuration() : appointment.getDuration();
        LocalTime newEndTime = newTime != null && newDuration != null ? newTime.plusMinutes(newDuration) : appointment.getEndTime();

        boolean dateOrTimeChanged = request.getAppointmentDate() != null || request.getAppointmentTime() != null || request.getDuration() != null;
        boolean doctorChanged = request.getDoctorId() != null;

        if (dateOrTimeChanged || doctorChanged) {
            Long doctorId = appointment.getDoctor().getId();
            if (request.getDoctorId() != null) {
                doctorId = request.getDoctorId();
            }

            List<Appointment> conflicts = appointmentRepository.findConflictingAppointmentsExcluding(
                    doctorId, newDate, newTime, newEndTime, appointmentId);
            if (!conflicts.isEmpty()) {
                throw new RuntimeException("New appointment time conflicts with existing appointments");
            }

            String availabilityError = checkDoctorAvailability(doctorId, newDate, newTime, newEndTime);
            if (availabilityError != null) {
                throw new RuntimeException(availabilityError);
            }

            appointment.setAppointmentDate(newDate);
            appointment.setAppointmentTime(newTime);
            appointment.setDuration(newDuration);
            appointment.setEndTime(newEndTime);
        }

        // Other simple fields
        if (request.getAppointmentType() != null) appointment.setAppointmentType(request.getAppointmentType());
        if (request.getReason() != null) appointment.setReason(request.getReason());
        if (request.getPriority() != null) appointment.setPriority(request.getPriority());
        if (request.getNotes() != null) appointment.setNotes(request.getNotes());
        if (request.getFollowUpRequired() != null) appointment.setFollowUpRequired(request.getFollowUpRequired());
        if (request.getFollowUpDate() != null) appointment.setFollowUpDate(request.getFollowUpDate());
        if (request.getInsuranceProvider() != null) appointment.setInsuranceProvider(request.getInsuranceProvider());
        if (request.getInsuranceNumber() != null) appointment.setInsuranceNumber(request.getInsuranceNumber());
        if (request.getCost() != null) appointment.setCost(request.getCost());
        if (request.getPaymentMethod() != null) appointment.setPaymentMethod(request.getPaymentMethod());

        Appointment updated = appointmentRepository.save(appointment);
        return convertToDto(updated);
    }

    public AppointmentDto rescheduleAppointment(Long appointmentId, LocalDate newDate, LocalTime newTime) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot reschedule a cancelled appointment");
        }

        // Check for conflicts with new time
        LocalTime newEndTime = newTime.plusMinutes(appointment.getDuration());
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointmentsExcluding(
                appointment.getDoctor().getId(), newDate, newTime, newEndTime, appointmentId);

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("New appointment time conflicts with existing appointments");
        }

        // Check doctor availability
        if (!isDoctorAvailable(appointment.getDoctor().getId(), newDate, newTime, newEndTime)) {
            throw new RuntimeException("Doctor is not available at the requested time");
        }

        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);
        appointment.setEndTime(newEndTime);
        appointment.setStatus(Appointment.AppointmentStatus.RESCHEDULED);

        Appointment rescheduledAppointment = appointmentRepository.save(appointment);
        return convertToDto(rescheduledAppointment);
    }

    public boolean isDoctorAvailable(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        return checkDoctorAvailability(doctorId, date, startTime, endTime) == null;
    }

    public String checkDoctorAvailability(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        // Get day of week (1=Monday, 7=Sunday)
        int dayOfWeek = date.getDayOfWeek().getValue();
        if (dayOfWeek == 1) dayOfWeek = 7; else dayOfWeek = dayOfWeek - 1;

        // Check if doctor has schedule for this day
        DoctorSchedule schedule = doctorScheduleRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek)
                .orElse(null);

        if (schedule == null) {
            return "Doctor has no schedule for " + getDayName(dayOfWeek) + " (" + date + ")";
        }

        if (!schedule.getIsAvailable()) {
            return "Doctor is not available on " + getDayName(dayOfWeek) + " (" + date + ")";
        }

        // Check if requested time is within doctor's schedule
        if (startTime.isBefore(schedule.getStartTime())) {
            return "Requested time " + startTime + " is before doctor's start time " + schedule.getStartTime() + " on " + getDayName(dayOfWeek);
        }

        if (endTime.isAfter(schedule.getEndTime())) {
            return "Requested end time " + endTime + " is after doctor's end time " + schedule.getEndTime() + " on " + getDayName(dayOfWeek);
        }

        // Check if requested time conflicts with break time
        if (schedule.getBreakStart() != null && schedule.getBreakEnd() != null) {
            if ((startTime.isBefore(schedule.getBreakEnd()) && endTime.isAfter(schedule.getBreakStart()))) {
                return "Requested time conflicts with doctor's break time (" + schedule.getBreakStart() + " - " + schedule.getBreakEnd() + ") on " + getDayName(dayOfWeek);
            }
        }

        return null; // Available
    }

    private String getDayName(int dayOfWeek) {
        switch (dayOfWeek) {
            case 1: return "Monday";
            case 2: return "Tuesday";
            case 3: return "Wednesday";
            case 4: return "Thursday";
            case 5: return "Friday";
            case 6: return "Saturday";
            case 7: return "Sunday";
            default: return "Unknown";
        }
    }

    public List<AppointmentDto> getAppointmentsNeedingReminders() {
        LocalDate tomorrow = timeService.getCurrentDate().plusDays(1);
        return appointmentRepository.findAppointmentsNeedingReminders(tomorrow)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void sendReminders() {
        List<Appointment> appointmentsNeedingReminders = appointmentRepository.findAppointmentsNeedingReminders(timeService.getCurrentDate().plusDays(1));
        
        for (Appointment appointment : appointmentsNeedingReminders) {
            try {
                if (appointment.getPatientEmail() != null) {
                    emailService.sendAppointmentReminder(
                        appointment.getPatientEmail(),
                        appointment.getPatientName(),
                        appointment.getDoctorName(),
                        appointment.getAppointmentDate(),
                        appointment.getAppointmentTime()
                    );
                }
                
                appointment.setReminderSent(true);
                appointment.setReminderSentAt(timeService.getCurrentDateTime());
                appointmentRepository.save(appointment);
            } catch (Exception e) {
                System.err.println("Failed to send reminder for appointment " + appointment.getId() + ": " + e.getMessage());
            }
        }
    }

    private AppointmentDto convertToDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setPatientName(appointment.getPatientName());
        dto.setPatientPhone(appointment.getPatientPhone());
        dto.setPatientEmail(appointment.getPatientEmail());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctorName());
        dto.setDoctorSpecialty(appointment.getDoctorSpecialty());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setDuration(appointment.getDuration());
        dto.setAppointmentType(appointment.getAppointmentType());
        dto.setReason(appointment.getReason());
        dto.setPriority(appointment.getPriority());
        dto.setNotes(appointment.getNotes());
        dto.setStatus(appointment.getStatus());
        dto.setCancelledAt(appointment.getCancelledAt());
        dto.setCancelledBy(appointment.getCancelledBy());
        dto.setCancellationReason(appointment.getCancellationReason());
        dto.setReminderSent(appointment.getReminderSent());
        dto.setReminderSentAt(appointment.getReminderSentAt());
        dto.setCheckInTime(appointment.getCheckInTime());
        dto.setCheckOutTime(appointment.getCheckOutTime());
        dto.setActualDuration(appointment.getActualDuration());
        dto.setFollowUpRequired(appointment.getFollowUpRequired());
        dto.setFollowUpDate(appointment.getFollowUpDate());
        dto.setInsuranceProvider(appointment.getInsuranceProvider());
        dto.setInsuranceNumber(appointment.getInsuranceNumber());
        dto.setCost(appointment.getCost());
        dto.setPaymentStatus(appointment.getPaymentStatus());
        dto.setPaymentMethod(appointment.getPaymentMethod());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());
        dto.setCreatedBy(appointment.getCreatedBy());
        dto.setUpdatedBy(appointment.getUpdatedBy());
        return dto;
    }
}