package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class TimeDeserializer extends JsonDeserializer<LocalTime> {
    
    @Override
    public LocalTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String timeString = p.getValueAsString();
        
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
