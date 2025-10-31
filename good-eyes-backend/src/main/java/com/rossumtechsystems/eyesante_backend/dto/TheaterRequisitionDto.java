package com.rossumtechsystems.eyesante_backend.dto;

import com.rossumtechsystems.eyesante_backend.entity.TheaterRequisition;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheaterRequisitionDto {
    private Long id;
    private String requisitionNumber;
    private String title;
    private String description;
    private Long requestedByUserId;
    private String requestedByUserName;
    private LocalDateTime requestedDate;
    private LocalDate requiredDate;
    private String status;
    private String priority;
    private Long departmentId;
    private String departmentName;
    private Long patientProcedureId;
    private String patientProcedureName;
    private Long approvedByUserId;
    private String approvedByUserName;
    private LocalDateTime approvedDate;
    private String rejectionReason;
    private String notes;
    private List<TheaterRequisitionItemDto> requisitionItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static TheaterRequisitionDto fromEntity(TheaterRequisition entity) {
        TheaterRequisitionDto dto = new TheaterRequisitionDto();
        dto.setId(entity.getId());
        dto.setRequisitionNumber(entity.getRequisitionNumber());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setRequestedDate(entity.getRequestedDate());
        dto.setRequiredDate(entity.getRequiredDate());
        dto.setStatus(entity.getStatus().name());
        dto.setPriority(entity.getPriority().name());
        dto.setRejectionReason(entity.getRejectionReason());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getRequestedBy() != null) {
            dto.setRequestedByUserId(entity.getRequestedBy().getId());
            dto.setRequestedByUserName(entity.getRequestedBy().getFirstName() + " " + entity.getRequestedBy().getLastName());
        }
        
        if (entity.getDepartment() != null) {
            dto.setDepartmentId(entity.getDepartment().getId());
            dto.setDepartmentName(entity.getDepartment().getName());
        }
        
        if (entity.getPatientProcedure() != null) {
            dto.setPatientProcedureId(entity.getPatientProcedure().getId());
            if (entity.getPatientProcedure().getProcedure() != null) {
                dto.setPatientProcedureName(entity.getPatientProcedure().getProcedure().getName());
            }
        }
        
        if (entity.getApprovedBy() != null) {
            dto.setApprovedByUserId(entity.getApprovedBy().getId());
            dto.setApprovedByUserName(entity.getApprovedBy().getFirstName() + " " + entity.getApprovedBy().getLastName());
            dto.setApprovedDate(entity.getApprovedDate());
        }
        
        if (entity.getRequisitionItems() != null) {
            dto.setRequisitionItems(entity.getRequisitionItems().stream()
                .map(TheaterRequisitionItemDto::fromEntity)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
}

