package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Find appointments by doctor and date
    Page<Appointment> findByDoctorIdAndAppointmentDateOrderByAppointmentTime(Long doctorId, LocalDate appointmentDate, Pageable pageable);
    
    // Find appointments by patient and date
    Page<Appointment> findByPatientIdAndAppointmentDateOrderByAppointmentTime(Long patientId, LocalDate appointmentDate, Pageable pageable);
    
    // Find appointments by status
    Page<Appointment> findByStatusOrderByAppointmentDateAscAppointmentTimeAsc(Appointment.AppointmentStatus status, Pageable pageable);
    
    // Find appointments by date range
    Page<Appointment> findByAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Find today's appointments
    List<Appointment> findByAppointmentDateOrderByAppointmentTime(LocalDate appointmentDate);
    
    // Find appointments by doctor, date, and time range (for conflict checking)
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :appointmentDate " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND ((a.appointmentTime < :endTime AND a.endTime > :startTime) " +
           "OR (:startTime < a.endTime AND :endTime > a.appointmentTime))")
    List<Appointment> findConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
    
    // Find appointments by doctor, date, and time range (excluding specific appointment)
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :appointmentDate " +
           "AND a.id != :excludeAppointmentId " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND ((a.appointmentTime < :endTime AND a.endTime > :startTime) " +
           "OR (:startTime < a.endTime AND :endTime > a.appointmentTime))")
    List<Appointment> findConflictingAppointmentsExcluding(
            @Param("doctorId") Long doctorId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeAppointmentId") Long excludeAppointmentId
    );
    
    // Find appointments by payment status
    Page<Appointment> findByPaymentStatusOrderByAppointmentDateDesc(Appointment.PaymentStatus paymentStatus, Pageable pageable);
    
    // Find appointments by appointment type
    Page<Appointment> findByAppointmentTypeOrderByAppointmentDateDesc(Appointment.AppointmentType appointmentType, Pageable pageable);
    
    // Find appointments by priority
    Page<Appointment> findByPriorityOrderByAppointmentDateAscAppointmentTimeAsc(Appointment.AppointmentPriority priority, Pageable pageable);
    
    // Find appointments that need reminders (scheduled for tomorrow)
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :tomorrow " +
           "AND a.status IN ('SCHEDULED', 'CONFIRMED') " +
           "AND a.reminderSent = false")
    List<Appointment> findAppointmentsNeedingReminders(@Param("tomorrow") LocalDate tomorrow);
    
    // Count appointments by status for a specific date
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date AND a.status = :status")
    long countByAppointmentDateAndStatus(@Param("date") LocalDate date, @Param("status") Appointment.AppointmentStatus status);
    
    // Find appointments by doctor and date range
    Page<Appointment> findByDoctorIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(
            Long doctorId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Find appointments by patient and date range
    Page<Appointment> findByPatientIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(
            Long patientId, LocalDate startDate, LocalDate endDate, Pageable pageable);
} 