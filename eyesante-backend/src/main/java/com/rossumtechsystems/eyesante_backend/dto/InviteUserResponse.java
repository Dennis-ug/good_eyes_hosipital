package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InviteUserResponse {
    private String message;
    private String invitationId;
    private String email;
    private LocalDateTime expiresAt;
    private boolean emailSent;
    private String emailStatus;
}
