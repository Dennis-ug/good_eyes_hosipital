package com.rossumtechsystems.eyesante_backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Centralized time service to ensure consistent timestamp handling across the application.
 * This service provides real, consistent timestamps using Uganda timezone (East Africa Time).
 */
@Service
public class TimeService {
    
    // Use Uganda timezone (East Africa Time - EAT) for consistency across the application
    private static final ZoneId UGANDA_ZONE = ZoneId.of("Africa/Kampala");
    
    /**
     * Get current date in Uganda timezone
     * @return Current date in Uganda timezone (EAT)
     */
    public LocalDate getCurrentDate() {
        return ZonedDateTime.now(UGANDA_ZONE).toLocalDate();
    }
    
    /**
     * Get current date and time in Uganda timezone
     * @return Current date and time in Uganda timezone (EAT)
     */
    public LocalDateTime getCurrentDateTime() {
        return ZonedDateTime.now(UGANDA_ZONE).toLocalDateTime();
    }
    
    /**
     * Get current date and time in a specific timezone
     * @param zoneId The timezone to use
     * @return Current date and time in the specified timezone
     */
    public LocalDateTime getCurrentDateTime(ZoneId zoneId) {
        return ZonedDateTime.now(zoneId).toLocalDateTime();
    }
    
    /**
     * Get current date in a specific timezone
     * @param zoneId The timezone to use
     * @return Current date in the specified timezone
     */
    public LocalDate getCurrentDate(ZoneId zoneId) {
        return ZonedDateTime.now(zoneId).toLocalDate();
    }
    
    /**
     * Convert a LocalDateTime to Uganda timezone
     * @param dateTime The date time to convert
     * @param fromZone The source timezone
     * @return The date time converted to Uganda timezone
     */
    public LocalDateTime toUgandaTime(LocalDateTime dateTime, ZoneId fromZone) {
        return ZonedDateTime.of(dateTime, fromZone)
                .withZoneSameInstant(UGANDA_ZONE)
                .toLocalDateTime();
    }
    
    /**
     * Convert a Uganda time LocalDateTime to a specific timezone
     * @param ugandaDateTime The Uganda time date time to convert
     * @param toZone The target timezone
     * @return The date time converted to the target timezone
     */
    public LocalDateTime fromUgandaTime(LocalDateTime ugandaDateTime, ZoneId toZone) {
        return ZonedDateTime.of(ugandaDateTime, UGANDA_ZONE)
                .withZoneSameInstant(toZone)
                .toLocalDateTime();
    }
    
    /**
     * Convert a LocalDateTime to UTC (for external API compatibility)
     * @param dateTime The date time to convert
     * @param fromZone The source timezone
     * @return The date time converted to UTC
     */
    public LocalDateTime toUtc(LocalDateTime dateTime, ZoneId fromZone) {
        return ZonedDateTime.of(dateTime, fromZone)
                .withZoneSameInstant(ZoneId.of("UTC"))
                .toLocalDateTime();
    }
    
    /**
     * Convert a UTC LocalDateTime to Uganda timezone
     * @param utcDateTime The UTC date time to convert
     * @return The date time converted to Uganda timezone
     */
    public LocalDateTime fromUtcToUganda(LocalDateTime utcDateTime) {
        return ZonedDateTime.of(utcDateTime, ZoneId.of("UTC"))
                .withZoneSameInstant(UGANDA_ZONE)
                .toLocalDateTime();
    }
}
