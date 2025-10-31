package com.rossumtechsystems.eyesante_backend.dto;

import java.time.LocalDate;
import java.util.List;

public class BatchAvailabilityRequest {
    private Long doctorId;
    private LocalDate date;
    private int duration;
    private List<String> timeSlots;

    // Default constructor
    public BatchAvailabilityRequest() {}

    // Constructor with all fields
    public BatchAvailabilityRequest(Long doctorId, LocalDate date, int duration, List<String> timeSlots) {
        this.doctorId = doctorId;
        this.date = date;
        this.duration = duration;
        this.timeSlots = timeSlots;
    }

    // Getters and setters
    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public List<String> getTimeSlots() {
        return timeSlots;
    }

    public void setTimeSlots(List<String> timeSlots) {
        this.timeSlots = timeSlots;
    }
}
