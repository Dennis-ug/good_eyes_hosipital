package com.rossumtechsystems.eyesante_backend.entity.eye_exmination;

import com.rossumtechsystems.eyesante_backend.entity.BaseAuditEntity;
import com.rossumtechsystems.eyesante_backend.entity.ReferralHospital;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "referral_details")
@Data
@EqualsAndHashCode(callSuper = true)
public class ReferralDetails extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_examination_id", nullable = false)
    private MainExamination mainExamination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referral_hospital_id", nullable = false)
    private ReferralHospital referralHospital;

    @Column(name = "referral_notes", columnDefinition = "TEXT")
    private String referralNotes;
} 