package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.MainExamination;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MainExaminationDto {
    private Long id;
    private Long visitSessionId;

    // External
    private String externalRight;
    private String externalLeft;

    // Slit lamp
    private List<SlitLampObservationDto> slitLampObservations;

    // CDR
    private BigDecimal cdrRight;
    private BigDecimal cdrLeft;

    // IOP
    private java.math.BigDecimal iopRight;
    private java.math.BigDecimal iopLeft;

    // Notes
    private String advice;
    private String historyComments;
    private String doctorsNotes;
    private LocalDateTime timeCompleted;

    public MainExaminationDto(MainExamination entity) {
        this.id = entity.getId();
        this.visitSessionId = entity.getVisitSession() != null ? entity.getVisitSession().getId() : null;
        this.externalRight = entity.getExternalRight();
        this.externalLeft = entity.getExternalLeft();
        this.slitLampObservations = entity.getSlitLampObservations() == null ? null :
                entity.getSlitLampObservations().stream().map(SlitLampObservationDto::new).collect(Collectors.toList());
        this.cdrRight = entity.getCdrRight();
        this.cdrLeft = entity.getCdrLeft();
        this.iopRight = entity.getIopRight();
        this.iopLeft = entity.getIopLeft();
        this.advice = entity.getAdvice();
        this.historyComments = entity.getHistoryComments();
        this.doctorsNotes = entity.getDoctorsNotes();
        this.timeCompleted = entity.getTimeCompleted();
    }
}