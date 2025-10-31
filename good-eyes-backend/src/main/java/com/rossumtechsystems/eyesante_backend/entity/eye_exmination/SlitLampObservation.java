package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "slit_lamp_observations")
@Data
public class SlitLampObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    // e.g., Lid, Conjunctiva, Cornea, AC, Iris, Lens, Vitreous
    @Column(name = "structure")
    private String structure;

    // free text finding
    @Column(name = "finding", columnDefinition = "TEXT")
    private String finding;

    // optional side: R/L/Both
    @Column(name = "eye_side")
    private String eyeSide;
}

