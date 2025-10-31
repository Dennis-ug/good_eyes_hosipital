package com.rossumtechsystems.eyesante_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class RoleDto {
    private Long id;
    
    @NotBlank(message = "Role name cannot be blank")
    private String name;
    
    @NotBlank(message = "Role description cannot be blank")
    private String description;
    
    private boolean enabled = true;
    private Set<Long> permissionIds;
} 