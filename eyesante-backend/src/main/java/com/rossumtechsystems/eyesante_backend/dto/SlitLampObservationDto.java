package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.SlitLampObservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlitLampObservationDto {
    private Long id;
    private String structure;
    private String finding;
    private String eyeSide;

    public SlitLampObservationDto(SlitLampObservation entity) {
        this.id = entity.getId();
        this.structure = entity.getStructure();
        this.finding = entity.getFinding();
        this.eyeSide = entity.getEyeSide();
    }
}

