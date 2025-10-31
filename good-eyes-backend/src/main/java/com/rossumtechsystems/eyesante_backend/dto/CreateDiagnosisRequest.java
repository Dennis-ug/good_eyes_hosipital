package com.rossumtechsystems.eyesante_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDiagnosisRequest {
    @NotBlank(message = "Diagnosis name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
