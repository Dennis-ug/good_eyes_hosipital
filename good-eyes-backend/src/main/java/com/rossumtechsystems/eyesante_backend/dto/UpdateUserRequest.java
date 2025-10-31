package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Long departmentId;
    private Boolean enabled;
}


