package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.TheaterRequisition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TheaterRequisitionRepository extends JpaRepository<TheaterRequisition, Long> {
    
    Optional<TheaterRequisition> findByRequisitionNumber(String requisitionNumber);
    
    List<TheaterRequisition> findByStatus(TheaterRequisition.RequisitionStatus status);
    
    Page<TheaterRequisition> findByStatus(TheaterRequisition.RequisitionStatus status, Pageable pageable);
    
    List<TheaterRequisition> findByRequestedByIdAndStatus(Long userId, TheaterRequisition.RequisitionStatus status);

    List<TheaterRequisition> findByApprovedByIdAndStatus(Long userId, TheaterRequisition.RequisitionStatus status);
    
    @Query("SELECT tr FROM TheaterRequisition tr WHERE tr.requestedDate BETWEEN :startDate AND :endDate ORDER BY tr.requestedDate DESC")
    List<TheaterRequisition> findByRequestedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT tr FROM TheaterRequisition tr WHERE tr.priority = :priority AND tr.status = :status ORDER BY tr.requestedDate ASC")
    List<TheaterRequisition> findByPriorityAndStatus(TheaterRequisition.RequisitionPriority priority, TheaterRequisition.RequisitionStatus status);
    
    @Query("SELECT tr FROM TheaterRequisition tr WHERE tr.patientProcedure.id = :procedureId ORDER BY tr.requestedDate DESC")
    List<TheaterRequisition> findByPatientProcedureId(Long procedureId);
    
    @Query("SELECT tr FROM TheaterRequisition tr WHERE tr.department.id = :departmentId AND tr.status = :status ORDER BY tr.requestedDate DESC")
    List<TheaterRequisition> findByDepartmentIdAndStatus(Long departmentId, TheaterRequisition.RequisitionStatus status);
    
    @Query("SELECT COUNT(tr) FROM TheaterRequisition tr WHERE tr.status = :status")
    long countByStatus(TheaterRequisition.RequisitionStatus status);
    
    @Query("SELECT tr FROM TheaterRequisition tr WHERE tr.status IN ('SUBMITTED', 'APPROVED') ORDER BY tr.priority DESC, tr.requestedDate ASC")
    List<TheaterRequisition> findPendingApprovals();
}

