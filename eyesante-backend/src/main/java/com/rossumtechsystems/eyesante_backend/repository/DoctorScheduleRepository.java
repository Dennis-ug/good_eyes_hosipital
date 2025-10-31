package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    
    // Find schedules by doctor
    List<DoctorSchedule> findByDoctorIdOrderByDayOfWeek(Long doctorId);
    
    // Find schedule by doctor and day of week
    Optional<DoctorSchedule> findByDoctorIdAndDayOfWeek(Long doctorId, Integer dayOfWeek);
    
    // Find available schedules by doctor
    List<DoctorSchedule> findByDoctorIdAndIsAvailableTrueOrderByDayOfWeek(Long doctorId);
    
    // Find all available schedules
    List<DoctorSchedule> findByIsAvailableTrueOrderByDoctorIdAscDayOfWeekAsc();
    
    // Find schedules by doctor and availability
    List<DoctorSchedule> findByDoctorIdAndIsAvailableOrderByDayOfWeek(Long doctorId, Boolean isAvailable);
    
    // Check if doctor has schedule for specific day
    boolean existsByDoctorIdAndDayOfWeekAndIsAvailableTrue(Long doctorId, Integer dayOfWeek);
    
    // Find schedules by day of week
    List<DoctorSchedule> findByDayOfWeekAndIsAvailableTrueOrderByDoctorId(Integer dayOfWeek);
    
    // Find schedules by doctor name (for search)
    List<DoctorSchedule> findByDoctorNameContainingIgnoreCaseAndIsAvailableTrue(String doctorName);
    
    // Find schedules by doctor and day range
    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId " +
           "AND ds.dayOfWeek BETWEEN :startDay AND :endDay " +
           "AND ds.isAvailable = true " +
           "ORDER BY ds.dayOfWeek")
    List<DoctorSchedule> findByDoctorIdAndDayOfWeekBetween(
            @Param("doctorId") Long doctorId,
            @Param("startDay") Integer startDay,
            @Param("endDay") Integer endDay
    );
} 