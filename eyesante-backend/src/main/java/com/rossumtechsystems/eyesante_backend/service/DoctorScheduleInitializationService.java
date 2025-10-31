package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.entity.DoctorSchedule;
import com.rossumtechsystems.eyesante_backend.entity.User;
import com.rossumtechsystems.eyesante_backend.repository.DoctorScheduleRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

import java.time.LocalTime;
import java.util.List;

// @Service
// @Transactional
public class DoctorScheduleInitializationService implements CommandLineRunner {

    @Autowired
    private DoctorScheduleRepository doctorScheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultDoctorSchedules();
    }

    private void initializeDefaultDoctorSchedules() {
        // Get all users with DOCTOR role
        List<User> allUsers = userRepository.findAll();
        List<User> doctors = allUsers.stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> "DOCTOR".equals(role.getName())))
                .toList();
        
        if (doctors.isEmpty()) {
            System.out.println("No doctors found. Creating default doctor schedules will be skipped.");
            return;
        }

        for (User doctor : doctors) {
            createDefaultScheduleForDoctor(doctor);
        }

        System.out.println("Default doctor schedules initialized successfully!");
    }

    private void createDefaultScheduleForDoctor(User doctor) {
        // Create schedule for Monday to Friday (days 1-5)
        for (int dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
            if (!doctorScheduleRepository.existsByDoctorIdAndDayOfWeekAndIsAvailableTrue(doctor.getId(), dayOfWeek)) {
                DoctorSchedule schedule = new DoctorSchedule();
                schedule.setDoctor(doctor);
                schedule.setDoctorName(doctor.getFirstName() + " " + doctor.getLastName());
                schedule.setDayOfWeek(dayOfWeek);
                schedule.setStartTime(LocalTime.of(8, 0)); // 8:00 AM
                schedule.setEndTime(LocalTime.of(17, 0)); // 5:00 PM
                schedule.setBreakStart(LocalTime.of(12, 0)); // 12:00 PM
                schedule.setBreakEnd(LocalTime.of(13, 0)); // 1:00 PM
                schedule.setIsAvailable(true);

                doctorScheduleRepository.save(schedule);
                System.out.println("Created default schedule for " + schedule.getDoctorName() + " on day " + dayOfWeek);
            }
        }

        // Create schedule for Saturday (day 6) - half day
        if (!doctorScheduleRepository.existsByDoctorIdAndDayOfWeekAndIsAvailableTrue(doctor.getId(), 6)) {
            DoctorSchedule saturdaySchedule = new DoctorSchedule();
            saturdaySchedule.setDoctor(doctor);
            saturdaySchedule.setDoctorName(doctor.getFirstName() + " " + doctor.getLastName());
            saturdaySchedule.setDayOfWeek(6);
            saturdaySchedule.setStartTime(LocalTime.of(8, 0)); // 8:00 AM
            saturdaySchedule.setEndTime(LocalTime.of(12, 0)); // 12:00 PM
            saturdaySchedule.setBreakStart(null); // No break on Saturday
            saturdaySchedule.setBreakEnd(null);
            saturdaySchedule.setIsAvailable(true);

            doctorScheduleRepository.save(saturdaySchedule);
            System.out.println("Created Saturday schedule for " + saturdaySchedule.getDoctorName());
        }
    }
} 