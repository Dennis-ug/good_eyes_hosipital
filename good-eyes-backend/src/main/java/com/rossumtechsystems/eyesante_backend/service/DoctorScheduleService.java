package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.DeleteScheduleResponse;
import com.rossumtechsystems.eyesante_backend.dto.DoctorScheduleDto;
import com.rossumtechsystems.eyesante_backend.entity.DoctorSchedule;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.DoctorScheduleRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DoctorScheduleService {

    @Autowired
    private DoctorScheduleRepository doctorScheduleRepository;

    @Autowired
    private UserRepository userRepository;

    public DoctorSchedule createSchedule(DoctorSchedule schedule) {
        // Validate doctor exists
        User doctor = userRepository.findById(schedule.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Set doctor name to username
        String doctorName = doctor.getUsername() != null ? doctor.getUsername() : "Unknown Doctor";
        schedule.setDoctorName(doctorName);

        // Validate schedule times
        validateScheduleTimes(schedule);

        // Check if schedule already exists for this doctor and day
        Optional<DoctorSchedule> existingSchedule = doctorScheduleRepository.findByDoctorIdAndDayOfWeek(
                schedule.getDoctor().getId(), schedule.getDayOfWeek());

        if (existingSchedule.isPresent()) {
            throw new RuntimeException("Schedule already exists for this doctor on this day");
        }

        return doctorScheduleRepository.save(schedule);
    }

    public DoctorSchedule updateSchedule(Long scheduleId, DoctorSchedule updatedSchedule) {
        DoctorSchedule existingSchedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // Validate schedule times
        validateScheduleTimes(updatedSchedule);

        // Update fields
        existingSchedule.setStartTime(updatedSchedule.getStartTime());
        existingSchedule.setEndTime(updatedSchedule.getEndTime());
        existingSchedule.setBreakStart(updatedSchedule.getBreakStart());
        existingSchedule.setBreakEnd(updatedSchedule.getBreakEnd());
        existingSchedule.setIsAvailable(updatedSchedule.getIsAvailable());

        return doctorScheduleRepository.save(existingSchedule);
    }

    public DeleteScheduleResponse deleteSchedule(Long scheduleId) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + scheduleId));
        
        // Store information before deletion
        String doctorName = schedule.getDoctorName();
        String dayName = schedule.getDayName();
        
        // Check if there are any future appointments for this doctor on this day of week
        // This is a business rule check - we could prevent deletion if there are future appointments
        // For now, we'll just log a warning but allow deletion
        
        doctorScheduleRepository.delete(schedule);
        
        return new DeleteScheduleResponse(
            "Schedule deleted successfully",
            scheduleId,
            doctorName,
            dayName,
            LocalDateTime.now(),
            true
        );
    }

    public DoctorSchedule getScheduleById(Long scheduleId) {
        return doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
    }

    public Page<DoctorSchedule> getAllSchedules(Pageable pageable) {
        return doctorScheduleRepository.findAll(pageable);
    }

    public Page<DoctorScheduleDto> getAllSchedulesDto(Pageable pageable) {
        Page<DoctorSchedule> schedules = doctorScheduleRepository.findAll(pageable);
        return schedules.map(this::toDto);
    }

    public List<DoctorSchedule> getSchedulesByDoctor(Long doctorId) {
        return doctorScheduleRepository.findByDoctorIdOrderByDayOfWeek(doctorId);
    }

    public List<DoctorScheduleDto> getSchedulesByDoctorDto(Long doctorId) {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdOrderByDayOfWeek(doctorId);
        return schedules.stream().map(this::toDto).toList();
    }

    public List<DoctorSchedule> getAvailableSchedulesByDoctor(Long doctorId) {
        return doctorScheduleRepository.findByDoctorIdAndIsAvailableTrueOrderByDayOfWeek(doctorId);
    }

    public List<DoctorScheduleDto> getAvailableSchedulesByDoctorDto(Long doctorId) {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdAndIsAvailableTrueOrderByDayOfWeek(doctorId);
        return schedules.stream().map(this::toDto).toList();
    }

    public List<DoctorSchedule> getAllAvailableSchedules() {
        return doctorScheduleRepository.findByIsAvailableTrueOrderByDoctorIdAscDayOfWeekAsc();
    }

    public List<DoctorScheduleDto> getAllAvailableSchedulesDto() {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByIsAvailableTrueOrderByDoctorIdAscDayOfWeekAsc();
        return schedules.stream().map(this::toDto).toList();
    }

    public List<DoctorSchedule> getSchedulesByDayOfWeek(Integer dayOfWeek) {
        return doctorScheduleRepository.findByDayOfWeekAndIsAvailableTrueOrderByDoctorId(dayOfWeek);
    }

    public List<DoctorScheduleDto> getSchedulesByDayOfWeekDto(Integer dayOfWeek) {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDayOfWeekAndIsAvailableTrueOrderByDoctorId(dayOfWeek);
        return schedules.stream().map(this::toDto).toList();
    }

    public List<DoctorSchedule> searchSchedulesByDoctorName(String doctorName) {
        return doctorScheduleRepository.findByDoctorNameContainingIgnoreCaseAndIsAvailableTrue(doctorName);
    }

    public List<DoctorScheduleDto> searchSchedulesByDoctorNameDto(String doctorName) {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorNameContainingIgnoreCaseAndIsAvailableTrue(doctorName);
        return schedules.stream().map(this::toDto).toList();
    }

    public boolean isDoctorAvailableOnDay(Long doctorId, Integer dayOfWeek) {
        return doctorScheduleRepository.existsByDoctorIdAndDayOfWeekAndIsAvailableTrue(doctorId, dayOfWeek);
    }

    public List<DoctorSchedule> getSchedulesByDoctorAndDayRange(Long doctorId, Integer startDay, Integer endDay) {
        return doctorScheduleRepository.findByDoctorIdAndDayOfWeekBetween(doctorId, startDay, endDay);
    }

    public List<DoctorScheduleDto> getSchedulesByDoctorAndDayRangeDto(Long doctorId, Integer startDay, Integer endDay) {
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdAndDayOfWeekBetween(doctorId, startDay, endDay);
        return schedules.stream().map(this::toDto).toList();
    }

    public void toggleScheduleAvailability(Long scheduleId) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        schedule.setIsAvailable(!schedule.getIsAvailable());
        doctorScheduleRepository.save(schedule);
    }

    private void validateScheduleTimes(DoctorSchedule schedule) {
        // Validate day of week
        if (schedule.getDayOfWeek() < 1 || schedule.getDayOfWeek() > 7) {
            throw new RuntimeException("Day of week must be between 1 and 7");
        }

        // Validate start and end times
        if (schedule.getStartTime() == null || schedule.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        if (schedule.getStartTime().isAfter(schedule.getEndTime()) || schedule.getStartTime().equals(schedule.getEndTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Validate break times if provided
        if (schedule.getBreakStart() != null || schedule.getBreakEnd() != null) {
            if (schedule.getBreakStart() == null || schedule.getBreakEnd() == null) {
                throw new RuntimeException("Both break start and end times must be provided");
            }

            if (schedule.getBreakStart().isAfter(schedule.getBreakEnd()) || schedule.getBreakStart().equals(schedule.getBreakEnd())) {
                throw new RuntimeException("Break end time must be after break start time");
            }

            if (schedule.getBreakStart().isBefore(schedule.getStartTime()) || schedule.getBreakEnd().isAfter(schedule.getEndTime())) {
                throw new RuntimeException("Break time must be within schedule time");
            }
        }
    }

    public String getDayName(Integer dayOfWeek) {
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

    public Integer getDayOfWeek(DayOfWeek dayOfWeek) {
        return dayOfWeek.getValue();
    }

    private DoctorScheduleDto toDto(DoctorSchedule schedule) {
        DoctorScheduleDto dto = new DoctorScheduleDto();
        dto.setId(schedule.getId());
        
        // Doctor Information
        if (schedule.getDoctor() != null) {
            dto.setDoctorId(schedule.getDoctor().getId());
            
            // Set doctor name - use stored name or fallback to username
            String doctorName = schedule.getDoctorName();
            if (doctorName == null || doctorName.trim().isEmpty()) {
                // Fallback to username
                User doctor = schedule.getDoctor();
                if (doctor.getUsername() != null) {
                    doctorName = doctor.getUsername();
                } else {
                    doctorName = "Unknown Doctor";
                }
            }
            dto.setDoctorName(doctorName);
            dto.setDoctorEmail(schedule.getDoctor().getEmail());
            
            // Set doctor specialty if available
            if (schedule.getDoctor().getRoles() != null && !schedule.getDoctor().getRoles().isEmpty()) {
                String specialty = schedule.getDoctor().getRoles().stream()
                    .map(role -> role.getName())
                    .filter(name -> name != null)
                    .collect(java.util.stream.Collectors.joining(", "));
                dto.setDoctorSpecialty(specialty);
            }
        }
        
        // Schedule Information
        dto.setDayOfWeek(schedule.getDayOfWeek());
        dto.setDayName(schedule.getDayName());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setBreakStart(schedule.getBreakStart());
        dto.setBreakEnd(schedule.getBreakEnd());
        dto.setIsAvailable(schedule.getIsAvailable());
        
        // Calculated fields
        if (schedule.getStartTime() != null && schedule.getEndTime() != null) {
            dto.setScheduleTime(schedule.getStartTime() + " - " + schedule.getEndTime());
            
            // Calculate total working hours in minutes
            Duration duration = Duration.between(schedule.getStartTime(), schedule.getEndTime());
            dto.setTotalWorkingHours((int) duration.toMinutes());
        }
        
        if (schedule.getBreakStart() != null && schedule.getBreakEnd() != null) {
            dto.setBreakTime(schedule.getBreakStart() + " - " + schedule.getBreakEnd());
        }
        
        // Audit Information
        dto.setCreatedAt(schedule.getCreatedAt());
        dto.setUpdatedAt(schedule.getUpdatedAt());
        dto.setCreatedBy(schedule.getCreatedBy());
        dto.setUpdatedBy(schedule.getUpdatedBy());
        
        return dto;
    }
} 