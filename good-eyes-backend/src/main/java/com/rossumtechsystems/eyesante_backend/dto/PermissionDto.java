package com.rossumtechsystems.eyesante_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PermissionDto {
    private Long id;
    
    @NotBlank(message = "Permission name cannot be blank")
    private String name;
    
    @NotBlank(message = "Permission description cannot be blank")
    private String description;
    
    private String resourceName;
    private String actionName;
    private boolean enabled = true;
} 