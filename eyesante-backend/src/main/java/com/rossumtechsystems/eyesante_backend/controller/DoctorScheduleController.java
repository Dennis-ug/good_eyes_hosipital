package com.rossumtechsystems.eyesante_backend.controller;

import com.rossumtechsystems.eyesante_backend.dto.DeleteScheduleResponse;
import com.rossumtechsystems.eyesante_backend.dto.DoctorScheduleDto;
import com.rossumtechsystems.eyesante_backend.entity.DoctorSchedule;
import com.rossumtechsystems.eyesante_backend.service.DoctorScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor-schedules")
@CrossOrigin(origins = "*")
public class DoctorScheduleController {

    @Autowired
    private DoctorScheduleService doctorScheduleService;

    // Get all doctor schedules with pagination
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Page<DoctorScheduleDto>> getAllSchedules(Pageable pageable) {
        Page<DoctorScheduleDto> schedules = doctorScheduleService.getAllSchedulesDto(pageable);
        return ResponseEntity.ok(schedules);
    }

    // Create doctor schedule
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR')")
    public ResponseEntity<DoctorSchedule> createSchedule(@Valid @RequestBody DoctorSchedule schedule) {
        DoctorSchedule createdSchedule = doctorScheduleService.createSchedule(schedule);
        return ResponseEntity.ok(createdSchedule);
    }

    // Update doctor schedule
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR')")
    public ResponseEntity<DoctorSchedule> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody DoctorSchedule schedule) {
        DoctorSchedule updatedSchedule = doctorScheduleService.updateSchedule(id, schedule);
        return ResponseEntity.ok(updatedSchedule);
    }

    // Delete doctor schedule
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR')")
    public ResponseEntity<DeleteScheduleResponse> deleteSchedule(@PathVariable Long id) {
        DeleteScheduleResponse response = doctorScheduleService.deleteSchedule(id);
        return ResponseEntity.ok(response);
    }

    // Get schedule by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<DoctorSchedule> getScheduleById(@PathVariable Long id) {
        DoctorSchedule schedule = doctorScheduleService.getScheduleById(id);
        return ResponseEntity.ok(schedule);
    }

    // Get all schedules for a doctor
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<DoctorScheduleDto>> getSchedulesByDoctor(@PathVariable Long doctorId) {
        List<DoctorScheduleDto> schedules = doctorScheduleService.getSchedulesByDoctorDto(doctorId);
        return ResponseEntity.ok(schedules);
    }

    // Get available schedules for a doctor
    @GetMapping("/doctor/{doctorId}/available")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<DoctorScheduleDto>> getAvailableSchedulesByDoctor(@PathVariable Long doctorId) {
        List<DoctorScheduleDto> schedules = doctorScheduleService.getAvailableSchedulesByDoctorDto(doctorId);
        return ResponseEntity.ok(schedules);
    }

    // Get all available schedules
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<DoctorScheduleDto>> getAllAvailableSchedules() {
        List<DoctorScheduleDto> schedules = doctorScheduleService.getAllAvailableSchedulesDto();
        return ResponseEntity.ok(schedules);
    }

    // Get schedules by day of week
    @GetMapping("/day/{dayOfWeek}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<DoctorScheduleDto>> getSchedulesByDayOfWeek(@PathVariable Integer dayOfWeek) {
        List<DoctorScheduleDto> schedules = doctorScheduleService.getSchedulesByDayOfWeekDto(dayOfWeek);
        return ResponseEntity.ok(schedules);
    }

    // Search schedules by doctor name
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<DoctorScheduleDto>> searchSchedulesByDoctorName(@RequestParam String doctorName) {
        List<DoctorScheduleDto> schedules = doctorScheduleService.searchSchedulesByDoctorNameDto(doctorName);
        return ResponseEntity.ok(schedules);
    }

    // Check if doctor is available on a specific day
    @GetMapping("/doctor/{doctorId}/day/{dayOfWeek}/available")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Boolean> isDoctorAvailableOnDay(
            @PathVariable Long doctorId,
            @PathVariable Integer dayOfWeek) {
        boolean available = doctorScheduleService.isDoctorAvailableOnDay(doctorId, dayOfWeek);
        return ResponseEntity.ok(available);
    }

    // Get schedules by doctor and day range
    @GetMapping("/doctor/{doctorId}/day-range")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<List<DoctorScheduleDto>> getSchedulesByDoctorAndDayRange(
            @PathVariable Long doctorId,
            @RequestParam Integer startDay,
            @RequestParam Integer endDay) {
        List<DoctorScheduleDto> schedules = doctorScheduleService.getSchedulesByDoctorAndDayRangeDto(doctorId, startDay, endDay);
        return ResponseEntity.ok(schedules);
    }

    // Toggle schedule availability
    @PutMapping("/{id}/toggle-availability")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR')")
    public ResponseEntity<String> toggleScheduleAvailability(@PathVariable Long id) {
        doctorScheduleService.toggleScheduleAvailability(id);
        return ResponseEntity.ok("Schedule availability toggled successfully");
    }

    // Get day name by day of week
    @GetMapping("/day-name/{dayOfWeek}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<String> getDayName(@PathVariable Integer dayOfWeek) {
        String dayName = doctorScheduleService.getDayName(dayOfWeek);
        return ResponseEntity.ok(dayName);
    }
} 