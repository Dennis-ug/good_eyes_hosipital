package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateConsumableCategoryRequest {
    private String name;
    private String description;
    private Long departmentId;
    private Boolean isActive;
}
