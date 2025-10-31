package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UserCreationResponse {
    private String message;
    private String username;
    private String email;
    private String temporaryPassword;
    private boolean emailSent;
    private String emailStatus;
    private Set<String> assignedRoles;
    private String departmentName;
    private LocalDateTime createdAt;
    private String createdBy;
} 