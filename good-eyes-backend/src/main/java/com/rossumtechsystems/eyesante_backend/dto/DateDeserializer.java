package com.rossumtechsystems.eyesante_backend.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateDeserializer extends JsonDeserializer<LocalDate> {
    
    @Override
    public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String dateString = p.getValueAsString();
        
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        // Remove timezone information if present (e.g., "2024-01-01T00:00:00+03" -> "2024-01-01")
        if (dateString.contains("T")) {
            dateString = dateString.substring(0, dateString.indexOf("T"));
        }
        
        // Handle different date formats
        if (dateString.matches("\\d{4}-\\d{2}-\\d{2}")) {
            // Format: "2024-01-01"
            return LocalDate.parse(dateString, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } else {
            // Try default parsing
            return LocalDate.parse(dateString);
        }
    }
}
