package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.CreatePatientVisitSessionRequest;
import com.rossumtechsystems.eyesante_backend.dto.PatientVisitSessionDto;
import com.rossumtechsystems.eyesante_backend.entity.Invoice;
import com.rossumtechsystems.eyesante_backend.entity.Patient;
import com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession;
import com.rossumtechsystems.eyesante_backend.repository.PatientRepository;
import com.rossumtechsystems.eyesante_backend.repository.PatientVisitSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientVisitSessionService {

    private final PatientVisitSessionRepository patientVisitSessionRepository;
    private final PatientRepository patientRepository;
    private final InvoiceService invoiceService;
    private final TimeService timeService;

    /**
     * Create a new patient visit session from request DTO
     */
    public PatientVisitSessionDto createVisitSession(CreatePatientVisitSessionRequest request) {
        log.info("Creating new patient visit session for patient ID: {}", request.getPatientId());
        
        try {
            // Find the patient
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + request.getPatientId()));
            
            // Create the visit session
            PatientVisitSession visitSession = new PatientVisitSession();
            visitSession.setPatient(patient);
            visitSession.setVisitPurpose(PatientVisitSession.VisitPurpose.valueOf(request.getVisitPurpose().toUpperCase()));
            visitSession.setCurrentStage(PatientVisitSession.VisitStage.RECEPTION);
            visitSession.setChiefComplaint(request.getChiefComplaint());
            visitSession.setRequiresTriage(request.getRequiresTriage() != null ? request.getRequiresTriage() : true);
            visitSession.setRequiresDoctorVisit(request.getRequiresDoctorVisit() != null ? request.getRequiresDoctorVisit() : true);
            visitSession.setIsEmergency(request.getIsEmergency() != null ? request.getIsEmergency() : false);
            // Set consultation fee amount
            visitSession.setConsultationFeeAmount(request.getConsultationFeeAmount() != null ? 
                    java.math.BigDecimal.valueOf(request.getConsultationFeeAmount()) : null);
            
            // Determine payment status based on consultation fee amount
            boolean shouldMarkAsPaid = false;
            if (request.getConsultationFeePaid() != null) {
                // Use the value from request if explicitly provided
                shouldMarkAsPaid = request.getConsultationFeePaid();
            }
            visitSession.setConsultationFeePaid(shouldMarkAsPaid);
            
            // Set payment method and reference
            visitSession.setPaymentMethod(request.getPaymentMethod() != null ? 
                    PatientVisitSession.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()) : null);
            visitSession.setPaymentReference(request.getPaymentReference());
            visitSession.setPreviousVisitId(request.getPreviousVisitId());
            visitSession.setEmergencyLevel(request.getEmergencyLevel() != null ? 
                    PatientVisitSession.EmergencyLevel.valueOf(request.getEmergencyLevel().toUpperCase()) : 
                    PatientVisitSession.EmergencyLevel.NONE);
            visitSession.setNotes(request.getNotes());
            
            // Set default values using EAT timezone
            visitSession.setVisitDate(timeService.getCurrentDateTime());
            visitSession.setStatus(PatientVisitSession.VisitStatus.REGISTERED);
            
            PatientVisitSession saved = patientVisitSessionRepository.save(visitSession);
            
            // Handle status based on consultation fee amount
            if (saved.getConsultationFeeAmount() == null || saved.getConsultationFeeAmount().doubleValue() <= 0) {
                // FREE consultation - no fee required
                saved.setStatus(PatientVisitSession.VisitStatus.FREE);
                saved.setCurrentStage(PatientVisitSession.VisitStage.TRIAGE);
                saved.setConsultationFeePaid(true); // Mark as paid since it's free
                saved = patientVisitSessionRepository.save(saved);
                log.info("Marked visit session ID: {} as FREE consultation - proceeding to TRIAGE", saved.getId());
            } else if (saved.getConsultationFeePaid()) {
                // Fee is already paid - create invoice and mark as completed
                try {
                    Invoice invoice = invoiceService.createConsultationInvoice(saved);
                    saved.setInvoice(invoice);
                    saved.setStatus(PatientVisitSession.VisitStatus.PAYMENT_COMPLETED);
                    saved.setCurrentStage(PatientVisitSession.VisitStage.TRIAGE);
                    saved = patientVisitSessionRepository.save(saved);
                    log.info("Consultation fee already paid for visit session ID: {} - proceeding to TRIAGE", saved.getId());
                } catch (Exception e) {
                    log.error("Failed to create invoice for paid visit session ID: {}", saved.getId(), e);
                    // Continue without invoice - can be created manually later
                    saved.setStatus(PatientVisitSession.VisitStatus.PAYMENT_COMPLETED);
                    saved.setCurrentStage(PatientVisitSession.VisitStage.TRIAGE);
                    saved = patientVisitSessionRepository.save(saved);
                    log.info("Visit session created successfully without invoice. Invoice can be created manually later.");
                }
            } else {
                // Fee is required but not paid - create invoice and mark as pending
                try {
                    Invoice invoice = invoiceService.createConsultationInvoice(saved);
                    saved.setInvoice(invoice);
                    saved.setStatus(PatientVisitSession.VisitStatus.PAYMENT_PENDING);
                    saved.setCurrentStage(PatientVisitSession.VisitStage.CASHIER);
                    saved = patientVisitSessionRepository.save(saved);
                    log.info("Created invoice for visit session ID: {} - payment pending", saved.getId());
                } catch (Exception e) {
                    log.error("Failed to create invoice for visit session ID: {}", saved.getId(), e);
                    // Continue without invoice - can be created manually later
                    saved.setStatus(PatientVisitSession.VisitStatus.PAYMENT_PENDING);
                    saved.setCurrentStage(PatientVisitSession.VisitStage.CASHIER);
                    saved = patientVisitSessionRepository.save(saved);
                    log.info("Visit session created successfully without automatic invoice. Invoice can be created manually later.");
                }
            }
            
            return new PatientVisitSessionDto(saved);
            
        } catch (Exception e) {
            log.error("Failed to create patient visit session for patient ID: {}", request.getPatientId(), e);
            throw new RuntimeException("Failed to create patient visit session: " + e.getMessage(), e);
        }
    }

    /**
     * Create a new patient visit session (legacy method)
     */
    public PatientVisitSessionDto createVisitSession(PatientVisitSession visitSession) {
        log.info("Creating new patient visit session for patient ID: {}", 
                visitSession.getPatient() != null ? visitSession.getPatient().getId() : "null");
        
        // Validate that patient is set
        if (visitSession.getPatient() == null) {
            throw new RuntimeException("Patient is required for creating a visit session");
        }
        
        // Set default values using EAT timezone
        if (visitSession.getVisitDate() == null) {
            visitSession.setVisitDate(timeService.getCurrentDateTime());
        }
        if (visitSession.getStatus() == null) {
            visitSession.setStatus(PatientVisitSession.VisitStatus.REGISTERED);
        }
        
        PatientVisitSession saved = patientVisitSessionRepository.save(visitSession);
        return new PatientVisitSessionDto(saved);
    }

    /**
     * Get visit session by ID
     */
    @Transactional(readOnly = true)
    public Optional<PatientVisitSessionDto> getVisitSessionById(Long id) {
        log.info("Fetching visit session by ID: {}", id);
        return patientVisitSessionRepository.findByIdWithPatientAndInvoice(id)
                .map(PatientVisitSessionDto::new);
    }

    /**
     * Get all visit sessions with pagination and optional search
     */
    @Transactional(readOnly = true)
    public Page<PatientVisitSessionDto> getAllVisitSessions(int page, int size, String search) {
        log.info("Fetching all visit sessions with page: {}, size: {}, search: {}", page, size, search);
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("visitDate").descending());
            Page<PatientVisitSession> visitSessionsPage;
            
            if (search != null && !search.trim().isEmpty()) {
                visitSessionsPage = patientVisitSessionRepository.searchVisitSessions(search.trim(), pageable);
            } else {
                visitSessionsPage = patientVisitSessionRepository.findAllWithPatient(pageable);
            }
            
            return visitSessionsPage.map(PatientVisitSessionDto::new);
        } catch (Exception e) {
            log.error("Error fetching visit sessions: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch visit sessions: " + e.getMessage());
        }
    }

    /**
     * Get visit sessions by patient ID
     */
    @Transactional(readOnly = true)
    public List<PatientVisitSessionDto> getVisitSessionsByPatientId(Long patientId) {
        log.info("Fetching visit sessions for patient ID: {}", patientId);
        try {
            return patientVisitSessionRepository.findByPatientIdWithPatient(patientId).stream()
                    .map(PatientVisitSessionDto::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching visit sessions for patient ID {}: {}", patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch visit sessions for patient: " + e.getMessage());
        }
    }

    /**
     * Get visit sessions by status
     */
    @Transactional(readOnly = true)
    public List<PatientVisitSessionDto> getVisitSessionsByStatus(String status) {
        log.info("Fetching visit sessions with status: {}", status);
        PatientVisitSession.VisitStatus visitStatus = PatientVisitSession.VisitStatus.valueOf(status.toUpperCase());
        return patientVisitSessionRepository.findByStatus(visitStatus).stream()
                .map(PatientVisitSessionDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Get visit sessions by purpose
     */
    @Transactional(readOnly = true)
    public List<PatientVisitSessionDto> getVisitSessionsByPurpose(String purpose) {
        log.info("Fetching visit sessions with purpose: {}", purpose);
        PatientVisitSession.VisitPurpose visitPurpose = PatientVisitSession.VisitPurpose.valueOf(purpose.toUpperCase());
        return patientVisitSessionRepository.findByVisitPurpose(visitPurpose).stream()
                .map(PatientVisitSessionDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Update visit session
     */
    public PatientVisitSessionDto updateVisitSession(Long id, PatientVisitSession visitSession) {
        log.info("Updating visit session ID: {}", id);
        
        PatientVisitSession existing = patientVisitSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + id));
        
        // Update fields (don't update patient relationship to avoid null issues)
        if (visitSession.getVisitPurpose() != null) {
            existing.setVisitPurpose(visitSession.getVisitPurpose());
        }
        if (visitSession.getChiefComplaint() != null) {
            existing.setChiefComplaint(visitSession.getChiefComplaint());
        }
        if (visitSession.getPreviousVisitId() != null) {
            existing.setPreviousVisitId(visitSession.getPreviousVisitId());
        }
        if (visitSession.getEmergencyLevel() != null) {
            existing.setEmergencyLevel(visitSession.getEmergencyLevel());
        }
        if (visitSession.getRequiresTriage() != null) {
            existing.setRequiresTriage(visitSession.getRequiresTriage());
        }
        if (visitSession.getRequiresDoctorVisit() != null) {
            existing.setRequiresDoctorVisit(visitSession.getRequiresDoctorVisit());
        }
        if (visitSession.getIsEmergency() != null) {
            existing.setIsEmergency(visitSession.getIsEmergency());
        }
        if (visitSession.getNotes() != null) {
            existing.setNotes(visitSession.getNotes());
        }
        
        PatientVisitSession saved = patientVisitSessionRepository.save(existing);
        return new PatientVisitSessionDto(saved);
    }

    /**
     * Update visit session status
     */
    public PatientVisitSessionDto updateVisitSessionStatus(Long id, String status) {
        log.info("Updating visit session ID: {} status to: {}", id, status);
        
        PatientVisitSession existing = patientVisitSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + id));
        
        PatientVisitSession.VisitStatus newStatus = PatientVisitSession.VisitStatus.valueOf(status.toUpperCase());
        existing.setStatus(newStatus);
        
        PatientVisitSession saved = patientVisitSessionRepository.save(existing);
        return new PatientVisitSessionDto(saved);
    }

    /**
     * Complete visit session
     */
    public PatientVisitSessionDto completeVisitSession(Long id) {
        log.info("Completing visit session ID: {}", id);
        
        PatientVisitSession existing = patientVisitSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + id));
        
        existing.setStatus(PatientVisitSession.VisitStatus.COMPLETED);
        
        PatientVisitSession saved = patientVisitSessionRepository.save(existing);
        return new PatientVisitSessionDto(saved);
    }

    /**
     * Cancel visit session
     */
    public PatientVisitSessionDto cancelVisitSession(Long id, String reason) {
        log.info("Cancelling visit session ID: {} with reason: {}", id, reason);
        
        PatientVisitSession existing = patientVisitSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + id));
        
        existing.setStatus(PatientVisitSession.VisitStatus.CANCELLED);
        if (reason != null) {
            existing.setNotes(existing.getNotes() + "\nCancellation reason: " + reason);
        }
        
        PatientVisitSession saved = patientVisitSessionRepository.save(existing);
        return new PatientVisitSessionDto(saved);
    }

    /**
     * Mark visit as no-show
     */
    public PatientVisitSessionDto markVisitAsNoShow(Long id) {
        log.info("Marking visit session ID: {} as no-show", id);
        
        PatientVisitSession existing = patientVisitSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + id));
        
        existing.setStatus(PatientVisitSession.VisitStatus.NO_SHOW);
        
        PatientVisitSession saved = patientVisitSessionRepository.save(existing);
        return new PatientVisitSessionDto(saved);
    }

    /**
     * Delete visit session
     */
    public void deleteVisitSession(Long id) {
        log.info("Deleting visit session ID: {}", id);
        
        if (!patientVisitSessionRepository.existsById(id)) {
            throw new RuntimeException("Visit session not found with ID: " + id);
        }
        
        patientVisitSessionRepository.deleteById(id);
    }

    /**
     * Get visit session statistics
     */
    @Transactional(readOnly = true)
    public Object getVisitSessionStatistics(String startDate, String endDate) {
        log.info("Fetching visit session statistics from {} to {}", startDate, endDate);
        
        // This would typically involve complex aggregation queries
        // For now, returning basic statistics
        return Map.of(
            "totalVisits", patientVisitSessionRepository.count(),
            "completedVisits", patientVisitSessionRepository.countByStatus(PatientVisitSession.VisitStatus.COMPLETED),
            "cancelledVisits", patientVisitSessionRepository.countByStatus(PatientVisitSession.VisitStatus.CANCELLED),
            "noShowVisits", patientVisitSessionRepository.countByStatus(PatientVisitSession.VisitStatus.NO_SHOW)
        );
    }

    /**
     * Search visit sessions
     */
    @Transactional(readOnly = true)
    public List<PatientVisitSessionDto> searchVisitSessions(String patientName, String status, String purpose, String startDate, String endDate) {
        log.info("Searching visit sessions with filters: patientName={}, status={}, purpose={}, startDate={}, endDate={}", 
                patientName, status, purpose, startDate, endDate);
        
        try {
            // This would typically involve a complex search query
            // For now, returning all sessions with patient data
            return patientVisitSessionRepository.findAllWithPatient().stream()
                    .map(PatientVisitSessionDto::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching visit sessions: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search visit sessions: " + e.getMessage());
        }
    }

    /**
     * Mark consultation fee as paid and progress to triage stage
     */
    public PatientVisitSessionDto markConsultationFeePaid(Long visitSessionId, String paymentMethod, String paymentReference) {
        log.info("Marking consultation fee as paid for visit session ID: {}", visitSessionId);
        
        PatientVisitSession visitSession = patientVisitSessionRepository.findById(visitSessionId)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + visitSessionId));
        
        // Mark fee as paid
        visitSession.setConsultationFeePaid(true);
        visitSession.setPaymentMethod(PatientVisitSession.PaymentMethod.valueOf(paymentMethod.toUpperCase()));
        visitSession.setPaymentReference(paymentReference);
        visitSession.setStatus(PatientVisitSession.VisitStatus.PAYMENT_COMPLETED);
        visitSession.setCurrentStage(PatientVisitSession.VisitStage.TRIAGE);
        
        // Update invoice if exists
        if (visitSession.getInvoice() != null) {
            invoiceService.markInvoiceAsPaid(visitSession.getInvoice(), 
                    visitSession.getPaymentMethod(), 
                    visitSession.getPaymentReference());
        }
        
        PatientVisitSession saved = patientVisitSessionRepository.save(visitSession);
        log.info("Consultation fee marked as paid for visit session ID: {}, progressing to triage stage", visitSessionId);
        
        return new PatientVisitSessionDto(saved);
    }
    
    /**
     * Progress visit session to next stage
     */
    public PatientVisitSessionDto progressToNextStage(Long visitSessionId) {
        log.info("Progressing visit session ID: {} to next stage", visitSessionId);
        
        PatientVisitSession visitSession = patientVisitSessionRepository.findById(visitSessionId)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + visitSessionId));
        
        PatientVisitSession.VisitStage currentStage = visitSession.getCurrentStage();
        PatientVisitSession.VisitStage nextStage = getNextStage(currentStage);
        
        // Check if trying to progress to TRIAGE stage
        if (nextStage == PatientVisitSession.VisitStage.TRIAGE) {
            // For FREE visits, allow progression without payment check
            if (visitSession.getStatus() == PatientVisitSession.VisitStatus.FREE) {
                log.info("Allowing progression to triage for FREE visit session ID: {}", visitSessionId);
            } else {
                // Verify payment is completed before allowing triage for paid visits
                if (!visitSession.getConsultationFeePaid()) {
                    throw new RuntimeException("Cannot proceed to triage: Consultation fee not paid. Current status: " + visitSession.getStatus());
                }
                
                // Check if there's a pending invoice
                if (visitSession.getInvoice() != null && visitSession.getInvoice().getPaymentStatus() != Invoice.PaymentStatus.PAID) {
                    throw new RuntimeException("Cannot proceed to triage: Invoice payment pending. Please complete payment first.");
                }
            }
        }
        
        visitSession.setCurrentStage(nextStage);
        
        // Update status based on stage
        switch (nextStage) {
            case TRIAGE:
                // Keep FREE status for free visits, otherwise set to PAYMENT_COMPLETED
                if (visitSession.getStatus() != PatientVisitSession.VisitStatus.FREE) {
                    visitSession.setStatus(PatientVisitSession.VisitStatus.PAYMENT_COMPLETED);
                }
                break;
            case BASIC_REFRACTION_EXAM:
                visitSession.setStatus(PatientVisitSession.VisitStatus.TRIAGE_COMPLETED);
                break;
            case DOCTOR_VISIT:
                visitSession.setStatus(PatientVisitSession.VisitStatus.BASIC_REFRACTION_COMPLETED);
                break;
            case PHARMACY:
                visitSession.setStatus(PatientVisitSession.VisitStatus.DOCTOR_VISIT_COMPLETED);
                break;
            case COMPLETED:
                visitSession.setStatus(PatientVisitSession.VisitStatus.COMPLETED);
                break;
            case CASHIER:
                visitSession.setStatus(PatientVisitSession.VisitStatus.MEDICATION_DISPENSED);
                break;
            case RECEPTION:
                visitSession.setStatus(PatientVisitSession.VisitStatus.COMPLETED);
                break;
        }
        
        PatientVisitSession saved = patientVisitSessionRepository.save(visitSession);
        log.info("Visit session ID: {} progressed from {} to {}", visitSessionId, currentStage, nextStage);
        
        return new PatientVisitSessionDto(saved);
    }
    
    /**
     * Get next stage based on current stage
     */
    private PatientVisitSession.VisitStage getNextStage(PatientVisitSession.VisitStage currentStage) {
        switch (currentStage) {
            case RECEPTION:
                return PatientVisitSession.VisitStage.CASHIER;
            case CASHIER:
                return PatientVisitSession.VisitStage.TRIAGE;
            case TRIAGE:
                return PatientVisitSession.VisitStage.BASIC_REFRACTION_EXAM;
            case BASIC_REFRACTION_EXAM:
                return PatientVisitSession.VisitStage.DOCTOR_VISIT;
            case DOCTOR_VISIT:
                return PatientVisitSession.VisitStage.PHARMACY;
            case PHARMACY:
                return PatientVisitSession.VisitStage.COMPLETED;
            case COMPLETED:
                return PatientVisitSession.VisitStage.COMPLETED; // Already at final stage
            default:
                return PatientVisitSession.VisitStage.RECEPTION;
        }
    }
} 