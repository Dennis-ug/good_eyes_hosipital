# Workflow Enhancement Summary

## Enhanced Patient Visit Workflow

### New Requirements:
1. **Triage should only happen if there's no pending invoice** (payment must be completed first)
2. **After triage completion, the next step should be Basic Refraction Exam** (not directly to doctor visit)

### Changes Made:

#### 1. PatientVisitSession.java - VisitStage Enum
Added new stage:
```java
public enum VisitStage {
    RECEPTION,              // Patient registered at reception
    CASHIER,                // Patient sent to cashier for payment
    TRIAGE,                 // Patient sent to triage for measurements
    BASIC_REFRACTION_EXAM,  // Patient sent for basic refraction examination
    DOCTOR_VISIT,           // Patient with doctor for examination
    PHARMACY,               // Patient sent to pharmacy for medication
    COMPLETED               // Visit fully completed
}
```

#### 2. PatientVisitSession.java - VisitStatus Enum
Added new status:
```java
public enum VisitStatus {
    REGISTERED,               // Patient registered
    INVOICE_CREATED,          // Invoice created (for paid services)
    PAYMENT_PENDING,          // Waiting for payment
    PAYMENT_COMPLETED,        // Payment received
    TRIAGE_COMPLETED,         // Triage measurements done
    BASIC_REFRACTION_COMPLETED, // Basic refraction examination completed
    DOCTOR_VISIT_COMPLETED,   // Doctor examination completed
    MEDICATION_DISPENSED,     // Medication given to patient
    COMPLETED,                // Visit fully completed
    CANCELLED,                // Visit cancelled
    NO_SHOW                   // Patient didn't show up
}
```

#### 3. PatientVisitSessionService.java - Enhanced Workflow Logic
Added payment validation before triage:
```java
// Check if trying to progress to TRIAGE stage
if (nextStage == PatientVisitSession.VisitStage.TRIAGE) {
    // Verify payment is completed before allowing triage
    if (!visitSession.getConsultationFeePaid()) {
        throw new RuntimeException("Cannot proceed to triage: Consultation fee not paid. Current status: " + visitSession.getStatus());
    }
    
    // Check if there's a pending invoice
    if (visitSession.getInvoice() != null && visitSession.getInvoice().getPaymentStatus() != Invoice.PaymentStatus.PAID) {
        throw new RuntimeException("Cannot proceed to triage: Invoice payment pending. Please complete payment first.");
    }
}
```

#### 4. Updated Stage Progression
New workflow:
1. RECEPTION → Patient registered
2. CASHIER → Payment processed
3. TRIAGE → Vital signs measured (only if payment completed)
4. BASIC_REFRACTION_EXAM → Basic refraction examination
5. DOCTOR_VISIT → Doctor examination
6. PHARMACY → Medication dispensed
7. COMPLETED → Visit finished

### API Impact:
- `progressToNextStage()` now validates payment before allowing triage
- New stage progression includes BASIC_REFRACTION_EXAM
- Enhanced error messages for payment validation

### Frontend Integration:
- Frontend should check payment status before allowing triage
- New stage for basic refraction exam needs UI implementation
- Error handling for payment validation messages

### Testing:
- Test payment validation before triage
- Test new stage progression
- Test error scenarios for pending invoices

## Status
✅ Partially implemented - need to complete getNextStage method update
