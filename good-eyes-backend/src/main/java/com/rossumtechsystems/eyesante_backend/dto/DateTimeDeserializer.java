package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
    
    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String dateTimeString = p.getValueAsString();
        
        if (dateTimeString == null || dateTimeString.trim().isEmpty()) {
            return null;
        }
        
        // Remove timezone information if present (e.g., "2024-01-01T13:42:00+03" -> "2024-01-01T13:42:00")
        if (dateTimeString.contains("+")) {
            dateTimeString = dateTimeString.substring(0, dateTimeString.indexOf("+"));
        }
        
        // Handle different datetime formats
        if (dateTimeString.matches("\\d{4}-\\d{2}-\\d{2}T\\d{1,2}:\\d{2}")) {
            // Format: "2024-01-01T13:42" (without seconds)
            return LocalDateTime.parse(dateTimeString, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        } else if (dateTimeString.matches("\\d{4}-\\d{2}-\\d{2}T\\d{1,2}:\\d{2}:\\d{2}")) {
            // Format: "2024-01-01T13:42:00" (with seconds)
            return LocalDateTime.parse(dateTimeString, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
        } else {
            // Try default parsing
            return LocalDateTime.parse(dateTimeString);
        }
    }
}
