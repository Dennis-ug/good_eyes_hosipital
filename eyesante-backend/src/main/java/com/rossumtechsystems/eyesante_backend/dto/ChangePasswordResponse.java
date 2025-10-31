package com.rossumtechsystems.eyesante_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordResponse {
    private String message;
    private String username;
    private boolean passwordChangeRequired;
    private LocalDateTime passwordChangedAt;
    private String status;
} 