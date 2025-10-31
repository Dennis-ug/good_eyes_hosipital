package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.dto.InvoiceDto;
import com.rossumtechsystems.eyesante_backend.dto.CreateInvoiceFromItemsRequest;
import com.rossumtechsystems.eyesante_backend.dto.CreateInvoiceRequest;
import com.rossumtechsystems.eyesante_backend.dto.InvoiceItemDto;
import com.rossumtechsystems.eyesante_backend.entity.*;
import com.rossumtechsystems.eyesante_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class FinanceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceItemRepository invoiceItemRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentTypeRepository appointmentTypeRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;
    
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private PatientProcedureRepository patientProcedureRepository;
    
    @Autowired
    private PatientVisitSessionRepository patientVisitSessionRepository;

    @Autowired
    private PatientTreatmentRepository patientTreatmentRepository;

    @Autowired
    private PatientInvestigationRepository patientInvestigationRepository;

    @Autowired
    private DeletedInvoiceRepository deletedInvoiceRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TimeService timeService;

    private static final DateTimeFormatter INVOICE_NUMBER_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * Automatically generate invoice for a completed appointment
     */
    public InvoiceDto generateInvoiceForAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        // Check if invoice already exists for this appointment
        Optional<Invoice> existingInvoice = invoiceRepository.findByAppointmentId(appointmentId);
        if (existingInvoice.isPresent()) {
            throw new RuntimeException("Invoice already exists for appointment ID: " + appointmentId);
        }

        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(timeService.getCurrentDate());
        invoice.setPatient(appointment.getPatient());
        invoice.setPatientName(appointment.getPatientName());
        invoice.setPatientPhone(appointment.getPatientPhone());
        invoice.setPatientEmail(appointment.getPatientEmail());
        invoice.setUser(appointment.getDoctor());
        invoice.setDoctorName(appointment.getDoctorName());
        invoice.setDoctorSpecialty(appointment.getDoctorSpecialty());
        invoice.setAppointment(appointment);
        invoice.setInsuranceProvider(appointment.getInsuranceProvider());
        invoice.setInsuranceNumber(appointment.getInsuranceNumber());
        invoice.setNotes("Auto-generated invoice for appointment");

        // Create invoice item for consultation
        InvoiceItem consultationItem = createConsultationItem(invoice, appointment);
        invoice.setInvoiceItems(List.of(consultationItem));

        // Calculate totals
        invoice.calculateTotals();

        // Save invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);
        invoiceItemRepository.save(consultationItem);

        return convertToDto(savedInvoice);
    }

    /**
     * Create consultation invoice item based on appointment type
     */
    private InvoiceItem createConsultationItem(Invoice invoice, Appointment appointment) {
        InvoiceItem item = new InvoiceItem();
        item.setInvoice(invoice);
        item.setItemName("Consultation - " + appointment.getAppointmentType().name().replace("_", " "));
        item.setItemDescription("Medical consultation for " + appointment.getReason());
        item.setItemType("CONSULTATION");
        item.setQuantity(1);

        // Get price from appointment type or use appointment cost
        BigDecimal unitPrice;
        if (appointment.getCost() != null) {
            unitPrice = appointment.getCost();
        } else {
            // Get default cost from appointment type
            AppointmentType appointmentType = appointmentTypeRepository.findByName(appointment.getAppointmentType().name())
                    .orElseThrow(() -> new RuntimeException("Appointment type not found: " + appointment.getAppointmentType()));
            unitPrice = appointmentType.getDefaultCost();
        }

        item.setUnitPrice(unitPrice);
        item.setTaxPercentage(new BigDecimal("18.00")); // 18% VAT
        item.setInsuranceCovered(appointment.getInsuranceProvider() != null);
        
        if (item.getInsuranceCovered()) {
            item.setInsuranceCoveragePercentage(new BigDecimal("80.00")); // 80% insurance coverage
        }

        item.calculateTotals();
        return item;
    }

    /**
     * Generate unique invoice number
     */
    private String generateInvoiceNumber() {
        String datePrefix = timeService.getCurrentDate().format(INVOICE_NUMBER_FORMAT);
        String baseNumber = "INV-" + datePrefix + "-";
        
        // Find the next sequence number for today
        int sequence = 1;
        String invoiceNumber = baseNumber + String.format("%04d", sequence);
        
        while (invoiceRepository.existsByInvoiceNumber(invoiceNumber)) {
            sequence++;
            invoiceNumber = baseNumber + String.format("%04d", sequence);
        }
        
        return invoiceNumber;
    }

    /**
     * Create invoice with patient and invoice items
     */
    public InvoiceDto createInvoiceWithItems(CreateInvoiceRequest request, String authenticatedUsername) {
        // Validate patient exists
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + request.getPatientId()));
        
        // Get the authenticated user who is creating the invoice
        User invoiceGenerator = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + authenticatedUsername));
        
        // Determine invoice purpose from the first item type
        String invoicePurpose = determineInvoicePurpose(request.getInvoiceItems());
        
        // Validate 2-minute interval for same purpose invoices
        validateInvoiceCreationInterval(patient.getId(), invoicePurpose);
        
        // Validate appointment if provided
        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + request.getAppointmentId()));
        }
        
        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setDueDate(request.getDueDate());
        
        // Set patient information
        invoice.setPatient(patient);
        invoice.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        invoice.setPatientPhone(patient.getPhone());
        
        // Set invoice generator information (the authenticated user)
        invoice.setUser(invoiceGenerator);
        invoice.setDoctorName(invoiceGenerator.getFirstName() + " " + invoiceGenerator.getLastName());
        
        // Set appointment if provided
        invoice.setAppointment(appointment);
        
        // Set invoice purpose
        invoice.setInvoicePurpose(invoicePurpose);

        // Set doctor information from appointment if available
        if (appointment != null) {
            invoice.setUser(appointment.getDoctor());
            invoice.setDoctorName(appointment.getDoctorName());
            invoice.setDoctorSpecialty(appointment.getDoctorSpecialty());
        }
        
        // Set financial information
        invoice.setTaxAmount(request.getTaxAmount());
        invoice.setDiscountAmount(request.getDiscountAmount());
        invoice.setNotes(request.getNotes());
        invoice.setInternalNotes(request.getInternalNotes());
        
        // Set insurance information
        invoice.setInsuranceProvider(request.getInsuranceProvider());
        invoice.setInsuranceNumber(request.getInsuranceNumber());
        invoice.setInsuranceCoverage(request.getInsuranceCoverage());
        
        // Create invoice items
        List<InvoiceItem> invoiceItems = request.getInvoiceItems().stream()
                .map(itemRequest -> createInvoiceItem(invoice, itemRequest))
                .collect(Collectors.toList());
        
        invoice.setInvoiceItems(invoiceItems);
        
        // Calculate totals
        invoice.calculateTotals();
        
        // Save invoice and items
        Invoice savedInvoice = invoiceRepository.save(invoice);
        invoiceItemRepository.saveAll(invoiceItems);
        
        return convertToDto(savedInvoice);
    }
    
    /**
     * Create invoice item from request
     */
    private InvoiceItem createInvoiceItem(Invoice invoice, CreateInvoiceRequest.CreateInvoiceItemRequest itemRequest) {
        InvoiceItem item = new InvoiceItem();
        item.setInvoice(invoice);
        item.setItemName(itemRequest.getItemName());
        item.setItemDescription(itemRequest.getItemDescription());
        item.setItemType(itemRequest.getItemType());
        item.setQuantity(itemRequest.getQuantity());
        item.setUnitPrice(itemRequest.getUnitPrice());
        item.setDiscountPercentage(itemRequest.getDiscountPercentage());
        item.setTaxPercentage(itemRequest.getTaxPercentage());
        item.setInsuranceCovered(itemRequest.getInsuranceCovered());
        item.setInsuranceCoveragePercentage(itemRequest.getInsuranceCoveragePercentage());
        item.setNotes(itemRequest.getNotes());
        
        // Handle inventory items
        if (itemRequest.getInventoryItemId() != null) {
            InventoryItem inventoryItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + itemRequest.getInventoryItemId()));
            
            // Check if enough stock is available
            if (inventoryItem.getQuantityInStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for item: " + inventoryItem.getName() + 
                    ". Available: " + inventoryItem.getQuantityInStock() + ", Requested: " + itemRequest.getQuantity());
            }
            
            // Update stock quantity
            inventoryItem.setQuantityInStock(inventoryItem.getQuantityInStock() - itemRequest.getQuantity());
            inventoryItemRepository.save(inventoryItem);
            
            // Set inventory item reference
            item.setInventoryItem(inventoryItem);
            item.setSku(inventoryItem.getSku());
            
            // Use inventory item price if not provided
            if (itemRequest.getUnitPrice() == null) {
                item.setUnitPrice(inventoryItem.getUnitPrice());
            }
        }
        
        // Calculate totals
        item.calculateTotals();
        
        return item;
    }

    /**
     * Get invoice by ID
     */
    public InvoiceDto getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + id));
        return convertToDto(invoice);
    }

    /**
     * Get invoice by invoice number
     */
    public InvoiceDto getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new RuntimeException("Invoice not found with number: " + invoiceNumber));
        return convertToDto(invoice);
    }

    /**
     * Get all invoices with pagination, ordered by date descending (latest first)
     */
    public Page<InvoiceDto> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAllByOrderByInvoiceDateDesc(pageable).map(this::convertToDto);
    }

    /**
     * Get invoices by patient
     */
    public Page<InvoiceDto> getInvoicesByPatient(Long patientId, Pageable pageable) {
        return invoiceRepository.findByPatientIdOrderByInvoiceDateDesc(patientId, pageable).map(this::convertToDto);
    }

    /**
     * Get invoices by user
     */
    public Page<InvoiceDto> getInvoicesByUser(Long userId, Pageable pageable) {
        Page<Invoice> invoices = invoiceRepository.findByUserIdOrderByInvoiceDateDesc(userId, pageable);
        return invoices.map(this::convertToDto);
    }

    /**
     * Get invoices by status
     */
    public Page<InvoiceDto> getInvoicesByStatus(Invoice.InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findByStatusOrderByInvoiceDateDesc(status, pageable).map(this::convertToDto);
    }

    /**
     * Get invoices by payment status
     */
    public Page<InvoiceDto> getInvoicesByPaymentStatus(Invoice.PaymentStatus paymentStatus, Pageable pageable) {
        return invoiceRepository.findByPaymentStatusOrderByInvoiceDateDesc(paymentStatus, pageable).map(this::convertToDto);
    }

    /**
     * Get invoices by date range
     */
    public Page<InvoiceDto> getInvoicesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return invoiceRepository.findByInvoiceDateBetweenOrderByInvoiceDateDesc(startDate, endDate, pageable).map(this::convertToDto);
    }

    /**
     * Get overdue invoices
     */
    public List<InvoiceDto> getOverdueInvoices() {
        return invoiceRepository.findOverdueInvoices(timeService.getCurrentDate())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get invoices with balance due
     */
    public Page<InvoiceDto> getInvoicesWithBalanceDue(Pageable pageable) {
        return invoiceRepository.findInvoicesWithBalanceDue(pageable).map(this::convertToDto);
    }

    /**
     * Record payment for an invoice
     */
    public InvoiceDto recordPayment(Long invoiceId, BigDecimal amount, Invoice.PaymentMethod method, String reference) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));

        // Track previous payment status to avoid double-adjusting inventory
        Invoice.PaymentStatus previousPaymentStatus = invoice.getPaymentStatus();

        invoice.addPayment(amount, method, reference);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        // If this is a full payment, update visit session and (if treatment invoice) adjust inventory
        if (previousPaymentStatus != Invoice.PaymentStatus.PAID && savedInvoice.getPaymentStatus() == Invoice.PaymentStatus.PAID) {
            try {
                // Convert Invoice.PaymentMethod to PatientVisitSession.PaymentMethod
                PatientVisitSession.PaymentMethod visitPaymentMethod = 
                    PatientVisitSession.PaymentMethod.valueOf(method.name());
                
                invoiceService.markInvoiceAsPaid(savedInvoice, visitPaymentMethod, reference);
            } catch (Exception e) {
                // Log error but don't fail the payment recording
                System.err.println("Failed to update visit session for paid invoice: " + e.getMessage());
            }

            adjustInventoryForPaidTreatmentInvoice(savedInvoice);
        }

        return convertToDto(savedInvoice);
    }

    /**
     * Update invoice status
     */
    public InvoiceDto updateInvoiceStatus(Long invoiceId, Invoice.InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        Invoice.InvoiceStatus previousStatus = invoice.getStatus();
        invoice.setStatus(status);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        // If status transitioned to PAID, also adjust inventory for treatment invoices
        if (previousStatus != Invoice.InvoiceStatus.PAID && savedInvoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            adjustInventoryForPaidTreatmentInvoice(savedInvoice);
        }
        return convertToDto(savedInvoice);
    }

    public void deleteInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));

        try {
            DeletedInvoice di = new DeletedInvoice();
            di.setOriginalInvoiceId(invoice.getId());
            di.setInvoiceNumber(invoice.getInvoiceNumber());
            di.setInvoiceDate(invoice.getInvoiceDate());
            if (invoice.getPatient() != null) {
                di.setPatientId(invoice.getPatient().getId());
            }
            di.setPatientName(invoice.getPatientName());
            di.setTotalAmount(invoice.getTotalAmount());
            di.setInvoicePurpose(invoice.getInvoicePurpose());
            if (invoice.getInvoiceItems() != null) {
                String itemsJson = objectMapper.writeValueAsString(
                        invoice.getInvoiceItems().stream().map(ii -> {
                            java.util.Map<String, Object> m = new java.util.HashMap<>();
                            m.put("itemName", ii.getItemName());
                            m.put("sku", ii.getSku());
                            m.put("quantity", ii.getQuantity());
                            m.put("unitPrice", ii.getUnitPrice());
                            m.put("finalPrice", ii.getFinalPrice());
                            m.put("inventoryItemId", ii.getInventoryItem() != null ? ii.getInventoryItem().getId() : null);
                            return m;
                        }).toList()
                );
                di.setItemsJson(itemsJson);
            }
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                di.setDeletedBy(auth.getName());
            }
            di.setDeletedAt(timeService.getCurrentDateTime());
            deletedInvoiceRepository.save(di);
        } catch (Exception e) {
            throw new RuntimeException("Failed to archive invoice before deletion: " + e.getMessage());
        }

        invoiceRepository.delete(invoice);
    }

    /**
     * Adjust inventory for paid invoices (treatments, optics, etc.)
     */
    private void adjustInventoryForPaidInvoice(Invoice paidInvoice) {
        String purpose = paidInvoice.getInvoicePurpose();
        if (!"TREATMENT_INVOICE_BILL".equalsIgnoreCase(purpose) &&
            !"OPTICS_INVOICE_BILL".equalsIgnoreCase(purpose)) {
            return;
        }

        try {
            if (paidInvoice.getInvoiceItems() == null || paidInvoice.getInvoiceItems().isEmpty()) {
                return;
            }

            for (InvoiceItem ii : paidInvoice.getInvoiceItems()) {
                if (ii.getInventoryItem() != null && ii.getQuantity() != null && ii.getQuantity() > 0) {
                    InventoryItem inv = ii.getInventoryItem();
                    int currentStock = inv.getQuantityInStock() == null ? 0 : inv.getQuantityInStock();

                    // Only adjust if there's sufficient stock
                    if (currentStock >= ii.getQuantity()) {
                        int newStock = currentStock - ii.getQuantity();
                        inv.setQuantityInStock(newStock);
                        inventoryItemRepository.save(inv);

                        System.out.println("Stock adjusted for item: " + inv.getName() +
                                         ", SKU: " + inv.getSku() +
                                         ", Quantity deducted: " + ii.getQuantity() +
                                         ", New stock: " + newStock);
                    } else {
                        System.err.println("Insufficient stock for item: " + inv.getName() +
                                         ", SKU: " + inv.getSku() +
                                         ", Required: " + ii.getQuantity() +
                                         ", Available: " + currentStock);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to adjust inventory for paid invoice (" + purpose + "): " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Legacy method for backward compatibility
     */
    private void adjustInventoryForPaidTreatmentInvoice(Invoice paidInvoice) {
        adjustInventoryForPaidInvoice(paidInvoice);
    }

    /**
     * Create invoice from patient procedures for a visit session
     */
    public InvoiceDto createInvoiceFromProcedures(Long visitSessionId, String authenticatedUsername) {
        // Get the authenticated user who is creating the invoice
        User invoiceGenerator = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + authenticatedUsername));
        
        // Get visit session
        PatientVisitSession visitSession = patientVisitSessionRepository.findById(visitSessionId)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + visitSessionId));
        
        // Get all procedures for this visit session
        List<PatientProcedure> procedures = patientProcedureRepository.findByVisitSessionId(visitSessionId);
        
        if (procedures.isEmpty()) {
            throw new RuntimeException("No procedures found for visit session ID: " + visitSessionId);
        }
        
        // Validate 2-minute interval for same purpose invoices
        validateInvoiceCreationInterval(visitSession.getPatient().getId(), "PROCEDURES_INVOICE_BILL");
        
        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(timeService.getCurrentDate());
        invoice.setDueDate(timeService.getCurrentDate().plusDays(30)); // Due in 30 days
        
        // Set patient information
        invoice.setPatient(visitSession.getPatient());
        invoice.setPatientName(visitSession.getPatient().getFirstName() + " " + visitSession.getPatient().getLastName());
        invoice.setPatientPhone(visitSession.getPatient().getPhone());
        
        // Set invoice generator information
        invoice.setUser(invoiceGenerator);
        invoice.setDoctorName(invoiceGenerator.getFirstName() + " " + invoiceGenerator.getLastName());
        invoice.setDoctorSpecialty("Ophthalmology"); // Default specialty
        
        // Note: Visit session reference will be set after invoice creation
        
        // Set notes and purpose
        invoice.setNotes("Invoice generated from submitted procedures for visit session " + visitSessionId);
        invoice.setInvoicePurpose("PROCEDURES_INVOICE_BILL");
        
        // Create invoice items from procedures
        List<InvoiceItem> invoiceItems = procedures.stream()
                .map(procedure -> createInvoiceItemFromProcedure(invoice, procedure))
                .collect(Collectors.toList());
        
        invoice.setInvoiceItems(invoiceItems);
        
        // Calculate totals
        invoice.calculateTotals();
        
        // Save invoice and items
        Invoice savedInvoice = invoiceRepository.save(invoice);
        invoiceItemRepository.saveAll(invoiceItems);
        
        // Do not block multiple invoices on visit session; keep existing linking behavior optional
        
        return convertToDto(savedInvoice);
    }

    /**
     * Create invoice from patient investigations for a visit session
     */
    public InvoiceDto createInvoiceFromInvestigations(Long visitSessionId, String authenticatedUsername) {
        return createInvoiceFromInvestigations(visitSessionId, authenticatedUsername, null);
    }

    public InvoiceDto createInvoiceFromInvestigations(Long visitSessionId, String authenticatedUsername, java.util.List<Long> investigationIds) {
        User invoiceGenerator = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + authenticatedUsername));

        PatientVisitSession visitSession = patientVisitSessionRepository.findById(visitSessionId)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + visitSessionId));

        List<PatientInvestigation> investigations;
        if (investigationIds != null && !investigationIds.isEmpty()) {
            investigations = patientInvestigationRepository.findAllById(investigationIds)
                    .stream()
                    .filter(pi -> pi.getVisitSession().getId().equals(visitSessionId))
                    .filter(pi -> Boolean.FALSE.equals(pi.getBilled()))
                    .toList();
        } else {
            // Fallback: Only include unbilled created today
            investigations = patientInvestigationRepository.findUnbilledCreatedOnDate(
                    visitSessionId, timeService.getCurrentDate());
        }
        if (investigations.isEmpty()) {
            throw new RuntimeException("No investigations found for visit session ID: " + visitSessionId);
        }

        // Validate 2-minute interval for same purpose invoices
        validateInvoiceCreationInterval(visitSession.getPatient().getId(), "INVESTIGATION_INVOICE_BILL");

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(timeService.getCurrentDate());
        invoice.setDueDate(timeService.getCurrentDate().plusDays(30));
        invoice.setPatient(visitSession.getPatient());
        invoice.setPatientName(visitSession.getPatient().getFirstName() + " " + visitSession.getPatient().getLastName());
        invoice.setPatientPhone(visitSession.getPatient().getPhone());
        invoice.setUser(invoiceGenerator);
        invoice.setDoctorName(invoiceGenerator.getFirstName() + " " + invoiceGenerator.getLastName());
        invoice.setDoctorSpecialty("Ophthalmology");
        invoice.setNotes("Invoice generated from submitted investigations for visit session " + visitSessionId);
        invoice.setInvoicePurpose("INVESTIGATION_INVOICE_BILL");

        List<InvoiceItem> invoiceItems = investigations.stream().map(inv -> {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setItemName(inv.getInvestigationType().getName());
            String desc = inv.getInvestigationType().getDescription();
            item.setItemDescription(desc);
            item.setItemType("INVESTIGATION");
            item.setQuantity(inv.getQuantity() == null ? 1 : inv.getQuantity());
            item.setUnitPrice(inv.getCost() == null ? java.math.BigDecimal.ZERO : inv.getCost());
            item.setDiscountPercentage(java.math.BigDecimal.ZERO);
            item.setTaxPercentage(new java.math.BigDecimal("18.00"));
            item.setInsuranceCovered(false);
            item.setInsuranceCoveragePercentage(java.math.BigDecimal.ZERO);
            item.setNotes(inv.getNotes());
            item.calculateTotals();
            return item;
        }).collect(java.util.stream.Collectors.toList());

        invoice.setInvoiceItems(invoiceItems);
        invoice.calculateTotals();
        Invoice saved = invoiceRepository.save(invoice);
        invoiceItemRepository.saveAll(invoiceItems);

        // Mark investigations as billed
        for (PatientInvestigation inv : investigations) {
            inv.setBilled(true);
            inv.setBilledAt(timeService.getCurrentDateTime());
        }
        patientInvestigationRepository.saveAll(investigations);
        return convertToDto(saved);
    }
    /**
     * Create invoice from patient treatments for a visit session
     */
    public InvoiceDto createInvoiceFromTreatments(Long visitSessionId, String authenticatedUsername) {
        User invoiceGenerator = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + authenticatedUsername));

        PatientVisitSession visitSession = patientVisitSessionRepository.findById(visitSessionId)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + visitSessionId));

        List<PatientTreatment> treatments = patientTreatmentRepository.findByVisitSessionId(visitSessionId);
        if (treatments.isEmpty()) {
            throw new RuntimeException("No treatments found for visit session ID: " + visitSessionId);
        }

        // Validate 2-minute interval for same purpose invoices
        validateInvoiceCreationInterval(visitSession.getPatient().getId(), "TREATMENT_INVOICE_BILL");

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(timeService.getCurrentDate());
        invoice.setDueDate(timeService.getCurrentDate().plusDays(30));
        invoice.setPatient(visitSession.getPatient());
        invoice.setPatientName(visitSession.getPatient().getFirstName() + " " + visitSession.getPatient().getLastName());
        invoice.setPatientPhone(visitSession.getPatient().getPhone());
        invoice.setUser(invoiceGenerator);
        invoice.setDoctorName(invoiceGenerator.getFirstName() + " " + invoiceGenerator.getLastName());
        invoice.setDoctorSpecialty("Ophthalmology");
        invoice.setNotes("Invoice generated from submitted treatments for visit session " + visitSessionId);
        invoice.setInvoicePurpose("TREATMENT_INVOICE_BILL");

        List<InvoiceItem> invoiceItems = treatments.stream().map(t -> {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setItemName(t.getItemName());
            item.setItemDescription("Treatment item " + (t.getSku() != null ? ("(" + t.getSku() + ")") : ""));
            item.setItemType("TREATMENT");
            item.setQuantity(t.getQuantity());
            item.setUnitPrice(t.getUnitPrice());
            item.setDiscountPercentage(BigDecimal.ZERO);
            item.setTaxPercentage(new BigDecimal("18.00"));
            item.setInsuranceCovered(false);
            item.setInsuranceCoveragePercentage(BigDecimal.ZERO);
            item.setNotes(t.getNotes());
            // Link invoice item to inventory for later stock adjustment upon payment
            if (t.getInventoryItem() != null) {
                item.setInventoryItem(t.getInventoryItem());
                item.setSku(t.getSku());
            }
            item.calculateTotals();
            return item;
        }).collect(java.util.stream.Collectors.toList());

        invoice.setInvoiceItems(invoiceItems);
        invoice.calculateTotals();
        Invoice saved = invoiceRepository.save(invoice);
        invoiceItemRepository.saveAll(invoiceItems);

        return convertToDto(saved);
    }

    /**
     * Create invoice from selected inventory items for a visit session
     */
    public InvoiceDto createInvoiceFromInventoryItems(Long visitSessionId, String authenticatedUsername, List<CreateInvoiceFromItemsRequest> itemSelections) {
        User invoiceGenerator = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + authenticatedUsername));

        PatientVisitSession visitSession = patientVisitSessionRepository.findById(visitSessionId)
                .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + visitSessionId));

        if (itemSelections == null || itemSelections.isEmpty()) {
            throw new RuntimeException("No items provided to create invoice");
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setInvoiceDate(timeService.getCurrentDate());
        invoice.setDueDate(timeService.getCurrentDate().plusDays(30));
        invoice.setPatient(visitSession.getPatient());
        invoice.setPatientName(visitSession.getPatient().getFirstName() + " " + visitSession.getPatient().getLastName());
        invoice.setPatientPhone(visitSession.getPatient().getPhone());
        invoice.setUser(invoiceGenerator);
        invoice.setDoctorName(invoiceGenerator.getFirstName() + " " + invoiceGenerator.getLastName());
        invoice.setDoctorSpecialty("Ophthalmology");
        invoice.setNotes("Invoice generated from selected items for visit session " + visitSessionId);
        invoice.setInvoicePurpose("OPTICS_INVOICE_BILL");

        List<InvoiceItem> invoiceItems = itemSelections.stream().map(sel -> {
            InventoryItem inv = inventoryItemRepository.findById(sel.getItemId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + sel.getItemId()));

            if (inv.getQuantityInStock() == null || inv.getQuantityInStock() < sel.getQuantity()) {
                throw new RuntimeException("Insufficient stock for item: " + inv.getName());
            }

            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setItemName(inv.getName());
            item.setItemDescription(inv.getDescription());
            item.setItemType("INVENTORY_ITEM");
            item.setQuantity(sel.getQuantity());
            item.setUnitPrice(inv.getUnitPrice());
            item.setDiscountPercentage(java.math.BigDecimal.ZERO);
            item.setTaxPercentage(new java.math.BigDecimal("18.00"));
            item.setInsuranceCovered(false);
            item.setInsuranceCoveragePercentage(java.math.BigDecimal.ZERO);
            item.setNotes(sel.getNotes());
            item.setInventoryItem(inv);
            item.setSku(inv.getSku());
            item.calculateTotals();
            return item;
        }).collect(java.util.stream.Collectors.toList());

        invoice.setInvoiceItems(invoiceItems);
        invoice.calculateTotals();
        Invoice saved = invoiceRepository.save(invoice);
        invoiceItemRepository.saveAll(invoiceItems);

        return convertToDto(saved);
    }
    
    /**
     * Create invoice item from patient procedure
     */
    private InvoiceItem createInvoiceItemFromProcedure(Invoice invoice, PatientProcedure procedure) {
        InvoiceItem item = new InvoiceItem();
        item.setInvoice(invoice);
        item.setItemName(procedure.getProcedure().getName());
        item.setItemDescription(procedure.getProcedure().getDescription());
        item.setItemType("PROCEDURE");
        item.setQuantity(1);
        item.setUnitPrice(procedure.getCost());
        item.setDiscountPercentage(BigDecimal.ZERO);
        item.setTaxPercentage(new BigDecimal("18.00")); // 18% VAT
        item.setInsuranceCovered(false);
        item.setInsuranceCoveragePercentage(BigDecimal.ZERO);
        item.setNotes(procedure.getNotes());
        
        // Calculate totals
        item.calculateTotals();
        
        return item;
    }

    /**
     * Get financial summary for a date range
     */
    public FinancialSummaryDto getFinancialSummary(LocalDate startDate, LocalDate endDate) {
        // Basic calculations
        Long totalInvoices = invoiceRepository.countByInvoiceDateBetween(startDate, endDate);
        BigDecimal totalRevenue = invoiceRepository.calculateTotalRevenue(startDate, endDate);
        BigDecimal totalPaid = invoiceRepository.calculateTotalPaid(startDate, endDate);
        BigDecimal totalOutstanding = invoiceRepository.calculateOutstandingBalance(startDate, endDate);
        BigDecimal totalOverdue = invoiceRepository.calculateTotalOverdue(startDate, endDate, LocalDate.now());
        BigDecimal averageInvoiceAmount = invoiceRepository.calculateAverageInvoiceAmount(startDate, endDate);
        
        // Handle null values
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;
        if (totalOutstanding == null) totalOutstanding = BigDecimal.ZERO;
        if (totalOverdue == null) totalOverdue = BigDecimal.ZERO;
        if (averageInvoiceAmount == null) averageInvoiceAmount = BigDecimal.ZERO;
        
        // Payment method breakdown
        Map<Invoice.PaymentMethod, BigDecimal> paymentMethodBreakdown = new HashMap<>();
        List<Object[]> paymentMethodData = invoiceRepository.getPaymentMethodBreakdown(startDate, endDate);
        for (Object[] row : paymentMethodData) {
            Invoice.PaymentMethod method = (Invoice.PaymentMethod) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            if (amount != null) {
                paymentMethodBreakdown.put(method, amount);
            }
        }
        
        // Status breakdown
        Map<Invoice.InvoiceStatus, Long> statusBreakdown = new HashMap<>();
        List<Object[]> statusData = invoiceRepository.getStatusBreakdown(startDate, endDate);
        for (Object[] row : statusData) {
            Invoice.InvoiceStatus status = (Invoice.InvoiceStatus) row[0];
            Long count = (Long) row[1];
            if (count != null) {
                statusBreakdown.put(status, count);
            }
        }
        
        // Top doctors (limit to top 5)
        List<TopDoctorDto> topDoctors = new ArrayList<>();
        List<Object[]> topDoctorsData = invoiceRepository.getTopDoctors(startDate, endDate);
        for (int i = 0; i < Math.min(5, topDoctorsData.size()); i++) {
            Object[] row = topDoctorsData.get(i);
            Long doctorId = (Long) row[0];
            String doctorName = (String) row[1];
            Long invoiceCount = (Long) row[2];
            BigDecimal revenue = (BigDecimal) row[3];
            
            if (doctorId != null && doctorName != null && invoiceCount != null && revenue != null) {
                topDoctors.add(new TopDoctorDto(doctorId, doctorName, invoiceCount, revenue));
            }
        }
        
        // Top services (limit to top 5)
        List<TopServiceDto> topServices = new ArrayList<>();
        List<Object[]> topServicesData = invoiceRepository.getTopServices(startDate, endDate);
        for (int i = 0; i < Math.min(5, topServicesData.size()); i++) {
            Object[] row = topServicesData.get(i);
            String serviceName = (String) row[0];
            Long invoiceCount = (Long) row[1];
            BigDecimal revenue = (BigDecimal) row[2];
            
            if (serviceName != null && invoiceCount != null && revenue != null) {
                topServices.add(new TopServiceDto(serviceName, invoiceCount, revenue));
            }
        }

        return new FinancialSummaryDto(startDate, endDate, totalInvoices, totalRevenue, totalPaid, 
                                     totalOutstanding, totalOverdue, averageInvoiceAmount, 
                                     paymentMethodBreakdown, statusBreakdown, topDoctors, topServices);
    }




    /**
     * Convert Invoice entity to DTO
     */
    private InvoiceDto convertToDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        
        // Patient information
        dto.setPatientId(invoice.getPatient().getId());
        dto.setPatientNumber(invoice.getPatient().getPatientNumber());
        dto.setPatientName(invoice.getPatientName());
        dto.setPatientPhone(invoice.getPatientPhone());
        dto.setPatientEmail(invoice.getPatientEmail());
        
        // Doctor information
        if (invoice.getUser() != null) {
            dto.setUserId(invoice.getUser().getId());
        }
        dto.setDoctorName(invoice.getDoctorName());
        dto.setDoctorSpecialty(invoice.getDoctorSpecialty());
        
        // Appointment information
        if (invoice.getAppointment() != null) {
            dto.setAppointmentId(invoice.getAppointment().getId());
        }
        
        // Financial information
        dto.setSubtotal(invoice.getSubtotal());
        dto.setTaxAmount(invoice.getTaxAmount());
        dto.setDiscountAmount(invoice.getDiscountAmount());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setAmountPaid(invoice.getAmountPaid());
        dto.setBalanceDue(invoice.getBalanceDue());
        
        // Status information
        dto.setStatus(invoice.getStatus());
        dto.setPaymentStatus(invoice.getPaymentStatus());
        // Purpose
        dto.setInvoicePurpose(invoice.getInvoicePurpose());
        
        // Payment information
        dto.setPaymentMethod(invoice.getPaymentMethod());
        dto.setPaymentReference(invoice.getPaymentReference());
        dto.setPaymentDate(invoice.getPaymentDate());
        
        // Insurance information
        dto.setInsuranceProvider(invoice.getInsuranceProvider());
        dto.setInsuranceNumber(invoice.getInsuranceNumber());
        dto.setInsuranceCoverage(invoice.getInsuranceCoverage());
        dto.setInsuranceAmount(invoice.getInsuranceAmount());
        
        // Notes
        dto.setNotes(invoice.getNotes());
        dto.setInternalNotes(invoice.getInternalNotes());
        
        // Invoice items
        if (invoice.getInvoiceItems() != null) {
            dto.setInvoiceItems(invoice.getInvoiceItems().stream()
                    .map(this::convertItemToDto)
                    .collect(Collectors.toList()));
        }
        
        // Audit information
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());
        dto.setCreatedBy(invoice.getCreatedBy());
        dto.setUpdatedBy(invoice.getUpdatedBy());
        
        return dto;
    }

    /**
     * Convert InvoiceItem entity to DTO
     */
    private InvoiceItemDto convertItemToDto(InvoiceItem item) {
        InvoiceItemDto dto = new InvoiceItemDto();
        dto.setId(item.getId());
        dto.setInvoiceId(item.getInvoice().getId());
        dto.setItemName(item.getItemName());
        dto.setItemDescription(item.getItemDescription());
        dto.setItemType(item.getItemType());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        dto.setDiscountPercentage(item.getDiscountPercentage());
        dto.setDiscountAmount(item.getDiscountAmount());
        dto.setFinalPrice(item.getFinalPrice());
        dto.setTaxPercentage(item.getTaxPercentage());
        dto.setTaxAmount(item.getTaxAmount());
        dto.setInsuranceCovered(item.getInsuranceCovered());
        dto.setInsuranceCoveragePercentage(item.getInsuranceCoveragePercentage());
        dto.setInsuranceAmount(item.getInsuranceAmount());
        dto.setNotes(item.getNotes());
        
        // Add inventory information if available
        if (item.getInventoryItem() != null) {
            dto.setInventoryItemId(item.getInventoryItem().getId());
            dto.setSku(item.getSku());
            dto.setInventoryItemName(item.getInventoryItem().getName());
            if (item.getInventoryItem().getCategory() != null) {
                dto.setInventoryCategoryName(item.getInventoryItem().getCategory().getName());
            }
        }
        
        return dto;
    }

    /**
     * Top Doctor DTO
     */
    public static class TopDoctorDto {
        private Long doctorId;
        private String doctorName;
        private Long totalInvoices;
        private BigDecimal totalRevenue;

        public TopDoctorDto() {}

        public TopDoctorDto(Long doctorId, String doctorName, Long totalInvoices, BigDecimal totalRevenue) {
            this.doctorId = doctorId;
            this.doctorName = doctorName;
            this.totalInvoices = totalInvoices;
            this.totalRevenue = totalRevenue;
        }

        // Getters and setters
        public Long getDoctorId() { return doctorId; }
        public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

        public Long getTotalInvoices() { return totalInvoices; }
        public void setTotalInvoices(Long totalInvoices) { this.totalInvoices = totalInvoices; }

        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    }

    /**
     * Top Service DTO
     */
    public static class TopServiceDto {
        private String serviceName;
        private Long totalInvoices;
        private BigDecimal totalRevenue;

        public TopServiceDto() {}

        public TopServiceDto(String serviceName, Long totalInvoices, BigDecimal totalRevenue) {
            this.serviceName = serviceName;
            this.totalInvoices = totalInvoices;
            this.totalRevenue = totalRevenue;
        }

        // Getters and setters
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }

        public Long getTotalInvoices() { return totalInvoices; }
        public void setTotalInvoices(Long totalInvoices) { this.totalInvoices = totalInvoices; }

        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    }

    /**
     * Financial Summary DTO
     */
    public static class FinancialSummaryDto {
        private LocalDate startDate;
        private LocalDate endDate;
        private Long totalInvoices;
        private BigDecimal totalRevenue;
        private BigDecimal totalPaid;
        private BigDecimal totalOutstanding;
        private BigDecimal totalOverdue;
        private BigDecimal averageInvoiceAmount;
        private Map<Invoice.PaymentMethod, BigDecimal> paymentMethodBreakdown;
        private Map<Invoice.InvoiceStatus, Long> statusBreakdown;
        private List<TopDoctorDto> topDoctors;
        private List<TopServiceDto> topServices;

        // Default constructor for backward compatibility
        public FinancialSummaryDto() {}

        // Legacy constructor for backward compatibility
        public FinancialSummaryDto(LocalDate startDate, LocalDate endDate, BigDecimal totalRevenue, BigDecimal outstandingBalance) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.totalRevenue = totalRevenue;
            this.totalOutstanding = outstandingBalance;
            this.totalInvoices = 0L;
            this.totalPaid = BigDecimal.ZERO;
            this.totalOverdue = BigDecimal.ZERO;
            this.averageInvoiceAmount = BigDecimal.ZERO;
            this.paymentMethodBreakdown = new HashMap<>();
            this.statusBreakdown = new HashMap<>();
            this.topDoctors = new ArrayList<>();
            this.topServices = new ArrayList<>();
        }

        // Full constructor
        public FinancialSummaryDto(LocalDate startDate, LocalDate endDate, Long totalInvoices, BigDecimal totalRevenue, 
                                 BigDecimal totalPaid, BigDecimal totalOutstanding, BigDecimal totalOverdue, 
                                 BigDecimal averageInvoiceAmount, Map<Invoice.PaymentMethod, BigDecimal> paymentMethodBreakdown,
                                 Map<Invoice.InvoiceStatus, Long> statusBreakdown, List<TopDoctorDto> topDoctors, 
                                 List<TopServiceDto> topServices) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.totalInvoices = totalInvoices;
            this.totalRevenue = totalRevenue;
            this.totalPaid = totalPaid;
            this.totalOutstanding = totalOutstanding;
            this.totalOverdue = totalOverdue;
            this.averageInvoiceAmount = averageInvoiceAmount;
            this.paymentMethodBreakdown = paymentMethodBreakdown;
            this.statusBreakdown = statusBreakdown;
            this.topDoctors = topDoctors;
            this.topServices = topServices;
        }

        // Getters and setters
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

        public Long getTotalInvoices() { return totalInvoices; }
        public void setTotalInvoices(Long totalInvoices) { this.totalInvoices = totalInvoices; }

        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

        public BigDecimal getTotalPaid() { return totalPaid; }
        public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }

        public BigDecimal getTotalOutstanding() { return totalOutstanding; }
        public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }

        public BigDecimal getTotalOverdue() { return totalOverdue; }
        public void setTotalOverdue(BigDecimal totalOverdue) { this.totalOverdue = totalOverdue; }

        public BigDecimal getAverageInvoiceAmount() { return averageInvoiceAmount; }
        public void setAverageInvoiceAmount(BigDecimal averageInvoiceAmount) { this.averageInvoiceAmount = averageInvoiceAmount; }

        public Map<Invoice.PaymentMethod, BigDecimal> getPaymentMethodBreakdown() { return paymentMethodBreakdown; }
        public void setPaymentMethodBreakdown(Map<Invoice.PaymentMethod, BigDecimal> paymentMethodBreakdown) { this.paymentMethodBreakdown = paymentMethodBreakdown; }

        public Map<Invoice.InvoiceStatus, Long> getStatusBreakdown() { return statusBreakdown; }
        public void setStatusBreakdown(Map<Invoice.InvoiceStatus, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }

        public List<TopDoctorDto> getTopDoctors() { return topDoctors; }
        public void setTopDoctors(List<TopDoctorDto> topDoctors) { this.topDoctors = topDoctors; }

        public List<TopServiceDto> getTopServices() { return topServices; }
        public void setTopServices(List<TopServiceDto> topServices) { this.topServices = topServices; }
    }
    
    /**
     * Determine invoice purpose based on the first item type
     */
    private String determineInvoicePurpose(List<CreateInvoiceRequest.CreateInvoiceItemRequest> invoiceItems) {
        if (invoiceItems == null || invoiceItems.isEmpty()) {
            return "GENERAL_INVOICE";
        }
        
        String firstItemType = invoiceItems.get(0).getItemType();
        if (firstItemType == null) {
            return "GENERAL_INVOICE";
        }
        
        // Map item types to invoice purposes
        switch (firstItemType.toUpperCase()) {
            case "CONSULTATION":
                return "CONSULTATION_INVOICE";
            case "PROCEDURE":
                return "PROCEDURES_INVOICE_BILL";
            case "MEDICATION":
                return "MEDICATION_INVOICE";
            case "LAB_TEST":
            case "INVESTIGATION":
                return "INVESTIGATION_INVOICE_BILL";
            case "TREATMENT":
                return "TREATMENT_INVOICE_BILL";
            case "INVENTORY_ITEM":
            case "OPTICS":
                return "OPTICS_INVOICE_BILL";
            default:
                return "GENERAL_INVOICE";
        }
    }
    
    /**
     * Validate that no invoice of the same purpose has been created for this patient within the last 2 minutes
     */
    private void validateInvoiceCreationInterval(Long patientId, String invoicePurpose) {
        // Calculate 2 minutes ago
        java.time.LocalDateTime twoMinutesAgo = timeService.getCurrentDateTime().minusMinutes(2);
        
        // Find recent invoices of the same purpose for this patient
        List<Invoice> recentInvoices = invoiceRepository.findRecentInvoicesByPatientAndPurpose(
            patientId, invoicePurpose, twoMinutesAgo);
        
        if (!recentInvoices.isEmpty()) {
            Invoice lastInvoice = recentInvoices.get(0); // Most recent invoice
            java.time.LocalDateTime lastInvoiceTime = lastInvoice.getCreatedAt();
            java.time.Duration timeDifference = java.time.Duration.between(lastInvoiceTime, timeService.getCurrentDateTime());
            
            long remainingSeconds = 120 - timeDifference.getSeconds(); // 120 seconds = 2 minutes
            
            if (remainingSeconds > 0) {
                throw new RuntimeException(
                    String.format("Cannot create another %s invoice for this patient. " +
                                "Please wait %d more seconds before creating another invoice of the same purpose. " +
                                "Last invoice was created %d seconds ago.",
                                invoicePurpose, remainingSeconds, timeDifference.getSeconds()));
            }
        }
    }
} 