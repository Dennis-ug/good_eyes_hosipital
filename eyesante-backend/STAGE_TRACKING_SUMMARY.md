# Stage Tracking and Automatic Invoice Summary

## What Was Implemented

### 1. **Automatic Invoice Creation**
- New consultations automatically create invoices
- Default consultation fee: $50.00
- Invoice linked to visit session

### 2. **Stage Tracking System**
- **RECEPTION**: Patient registered
- **CASHIER**: Patient at cashier for payment  
- **TRIAGE**: Patient at triage for measurements
- **DOCTOR_VISIT**: Patient with doctor
- **PHARMACY**: Patient at pharmacy
- **COMPLETED**: Visit finished

### 3. **Database Changes**
- Added `current_stage` field to `patient_visit_sessions`
- Created migration script `V13__add_visit_stage_tracking.sql`
- Added indexes for performance

### 4. **New Services**
- `InvoiceService`: Handles automatic invoice creation
- Updated `PatientVisitSessionService`: Manages stage progression

### 5. **Updated DTOs**
- `PatientVisitSessionDto`: Added `currentStage` field
- `CreatePatientVisitSessionRequest`: Added `currentStage` field

## Workflow

1. **Reception**: Create visit session → Stage: RECEPTION
2. **Cashier**: Pay consultation fee → Stage: CASHIER → TRIAGE  
3. **Triage**: Complete measurements → Stage: TRIAGE → DOCTOR_VISIT
4. **Doctor**: Complete examination → Stage: DOCTOR_VISIT → PHARMACY
5. **Pharmacy**: Dispense medication → Stage: PHARMACY → COMPLETED

## API Usage

```bash
# Create consultation (auto-creates invoice)
POST /api/patient-visit-sessions
{
  "patientId": 123,
  "visitPurpose": "NEW_CONSULTATION"
}

# Mark fee as paid (progresses to triage)
PUT /api/patient-visit-sessions/{id}/mark-fee-paid
{
  "paymentMethod": "CASH",
  "paymentReference": "REF-123"
}

# Progress to next stage
PUT /api/patient-visit-sessions/{id}/progress-stage
```

## Status: ✅ Complete
- All functionality implemented
- Database migration ready
- API endpoints updated
- Service layer enhanced 