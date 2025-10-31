package com.rossumtechsystems.eyesante_backend.util;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class TimeUtils {
    
    /**
     * Parse a time string that may contain timezone information.
     * Removes timezone information and parses the time portion.
     * 
     * @param timeString The time string to parse (e.g., "13:42:00+03" or "13:42")
     * @return LocalTime object
     */
    public static LocalTime parseTime(String timeString) {
        if (timeString == null || timeString.trim().isEmpty()) {
            return null;
        }
        
        // Remove timezone information if present (e.g., "13:42:00+03" -> "13:42:00")
        if (timeString.contains("+")) {
            timeString = timeString.substring(0, timeString.indexOf("+"));
        }
        
        // Handle different time formats
        if (timeString.matches("\\d{1,2}:\\d{2}")) {
            // Format: "13:42"
            return LocalTime.parse(timeString, DateTimeFormatter.ofPattern("H:mm"));
        } else if (timeString.matches("\\d{1,2}:\\d{2}:\\d{2}")) {
            // Format: "13:42:00"
            return LocalTime.parse(timeString, DateTimeFormatter.ofPattern("H:mm:ss"));
        } else {
            // Try default parsing
            return LocalTime.parse(timeString);
        }
    }
}
