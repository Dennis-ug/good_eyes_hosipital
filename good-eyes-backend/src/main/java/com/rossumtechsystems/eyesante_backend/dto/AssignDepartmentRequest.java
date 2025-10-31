package com.rossumtechsystems.eyesante_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignDepartmentRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Department ID is required")
    private Long departmentId;
} 