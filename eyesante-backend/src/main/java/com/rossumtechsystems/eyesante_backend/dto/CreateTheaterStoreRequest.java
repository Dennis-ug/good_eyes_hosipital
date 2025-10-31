package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTheaterStoreRequest {
    
    @NotBlank(message = "Store name is required")
    @Size(max = 100, message = "Store name must not exceed 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;
    
    @NotBlank(message = "Store type is required")
    @Size(max = 50, message = "Store type must not exceed 50 characters")
    private String storeType = "SURGICAL";
    
    private Integer capacity;
    
    @NotNull(message = "Active status is required")
    private Boolean isActive = true;
    
    private Long managedByUserId;
}
