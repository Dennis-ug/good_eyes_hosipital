# Automatic Invoice Creation and Stage Tracking

## Overview
This implementation adds automatic invoice creation for new consultations and a comprehensive stage tracking system for patient visit sessions. The system now tracks patients through different stages of their visit journey.

## Features

### 1. Automatic Invoice Creation
- **Trigger**: New consultation visits automatically create invoices
- **Amount**: Uses consultation fee amount or defaults to $50.00
- **Status**: Invoice created with PENDING status
- **Integration**: Links invoice to visit session

### 2. Stage Tracking System
- **RECEPTION**: Patient registered at reception
- **CASHIER**: Patient sent to cashier for payment
- **TRIAGE**: Patient sent to triage for measurements
- **DOCTOR_VISIT**: Patient with doctor for examination
- **PHARMACY**: Patient sent to pharmacy for medication
- **COMPLETED**: Visit fully completed

### 3. Payment Processing
- **Payment Tracking**: Marks consultation fee as paid
- **Stage Progression**: Automatically moves to next stage
- **Invoice Update**: Updates invoice payment status

## Database Changes

### New Fields Added
```sql
-- Added to patient_visit_sessions table
ALTER TABLE patient_visit_sessions 
ADD COLUMN current_stage VARCHAR(50) NOT NULL DEFAULT 'RECEPTION';
```

### New Enum Values
```java
public enum VisitStage {
    RECEPTION,      // Patient registered at reception
    CASHIER,        // Patient sent to cashier for payment
    TRIAGE,         // Patient sent to triage for measurements
    DOCTOR_VISIT,   // Patient with doctor for examination
    PHARMACY,       // Patient sent to pharmacy for medication
    COMPLETED       // Visit fully completed
}
```

## API Endpoints

### 1. Create Visit Session (Updated)
```http
POST /api/patient-visit-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": 123,
  "visitPurpose": "NEW_CONSULTATION",
  "currentStage": "RECEPTION",
  "chiefComplaint": "Eye pain and blurry vision",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "consultationFeeAmount": 50.00
}
```

**Response:**
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "visitDate": "2024-01-15T10:30:00",
  "visitPurpose": "NEW_CONSULTATION",
  "status": "INVOICE_CREATED",
  "currentStage": "CASHIER",
  "consultationFeePaid": false,
  "consultationFeeAmount": 50.00,
  "paymentMethod": null,
  "paymentReference": null,
  "chiefComplaint": "Eye pain and blurry vision",
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": null,
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "createdBy": "receptionist",
  "updatedBy": "receptionist"
}
```

### 2. Mark Consultation Fee as Paid
```http
PUT /api/patient-visit-sessions/{id}/mark-fee-paid
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "CASH",
  "paymentReference": "REF-123456"
}
```

**Response:**
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "visitDate": "2024-01-15T10:30:00",
  "visitPurpose": "NEW_CONSULTATION",
  "status": "PAYMENT_COMPLETED",
  "currentStage": "TRIAGE",
  "consultationFeePaid": true,
  "consultationFeeAmount": 50.00,
  "paymentMethod": "CASH",
  "paymentReference": "REF-123456",
  "chiefComplaint": "Eye pain and blurry vision",
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": null,
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:35:00",
  "createdBy": "receptionist",
  "updatedBy": "cashier"
}
```

### 3. Progress to Next Stage
```http
PUT /api/patient-visit-sessions/{id}/progress-stage
Authorization: Bearer <token>
```

**Response (Triage to Doctor Visit):**
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "visitDate": "2024-01-15T10:30:00",
  "visitPurpose": "NEW_CONSULTATION",
  "status": "TRIAGE_COMPLETED",
  "currentStage": "DOCTOR_VISIT",
  "consultationFeePaid": true,
  "consultationFeeAmount": 50.00,
  "paymentMethod": "CASH",
  "paymentReference": "REF-123456",
  "chiefComplaint": "Eye pain and blurry vision",
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": null,
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:00:00",
  "createdBy": "receptionist",
  "updatedBy": "nurse"
}
```

**Response (Doctor Visit to Pharmacy):**
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "visitDate": "2024-01-15T10:30:00",
  "visitPurpose": "NEW_CONSULTATION",
  "status": "DOCTOR_VISIT_COMPLETED",
  "currentStage": "PHARMACY",
  "consultationFeePaid": true,
  "consultationFeeAmount": 50.00,
  "paymentMethod": "CASH",
  "paymentReference": "REF-123456",
  "chiefComplaint": "Eye pain and blurry vision",
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": "Prescription: Eye drops 3x daily",
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:30:00",
  "createdBy": "receptionist",
  "updatedBy": "doctor"
}
```

**Response (Pharmacy to Completed):**
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "visitDate": "2024-01-15T10:30:00",
  "visitPurpose": "NEW_CONSULTATION",
  "status": "COMPLETED",
  "currentStage": "COMPLETED",
  "consultationFeePaid": true,
  "consultationFeeAmount": 50.00,
  "paymentMethod": "CASH",
  "paymentReference": "REF-123456",
  "chiefComplaint": "Eye pain and blurry vision",
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": "Medication dispensed: Eye drops",
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T12:00:00",
  "createdBy": "receptionist",
  "updatedBy": "pharmacist"
}
```

### 4. Get Visit Session by ID
```http
GET /api/patient-visit-sessions/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "visitDate": "2024-01-15T10:30:00",
  "visitPurpose": "NEW_CONSULTATION",
  "status": "PAYMENT_COMPLETED",
  "currentStage": "TRIAGE",
  "consultationFeePaid": true,
  "consultationFeeAmount": 50.00,
  "paymentMethod": "CASH",
  "paymentReference": "REF-123456",
  "chiefComplaint": "Eye pain and blurry vision",
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": null,
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:35:00",
  "createdBy": "receptionist",
  "updatedBy": "cashier"
}
```

### 5. Get Visit Sessions by Patient ID
```http
GET /api/patient-visit-sessions/patient/{patientId}
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 123,
    "patientName": "John Doe",
    "visitDate": "2024-01-15T10:30:00",
    "visitPurpose": "NEW_CONSULTATION",
    "status": "COMPLETED",
    "currentStage": "COMPLETED",
    "consultationFeePaid": true,
    "consultationFeeAmount": 50.00,
    "paymentMethod": "CASH",
    "paymentReference": "REF-123456",
    "chiefComplaint": "Eye pain and blurry vision",
    "previousVisitId": null,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": "Medication dispensed",
    "invoiceId": 1,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T12:00:00",
    "createdBy": "receptionist",
    "updatedBy": "pharmacist"
  },
  {
    "id": 2,
    "patientId": 123,
    "patientName": "John Doe",
    "visitDate": "2024-01-20T14:00:00",
    "visitPurpose": "FOLLOW_UP",
    "status": "REGISTERED",
    "currentStage": "RECEPTION",
    "consultationFeePaid": false,
    "consultationFeeAmount": null,
    "paymentMethod": null,
    "paymentReference": null,
    "chiefComplaint": "Follow-up check",
    "previousVisitId": 1,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": null,
    "invoiceId": null,
    "createdAt": "2024-01-20T14:00:00",
    "updatedAt": "2024-01-20T14:00:00",
    "createdBy": "receptionist",
    "updatedBy": "receptionist"
  }
]
```

### 6. Get Visit Sessions by Status
```http
GET /api/patient-visit-sessions/status/PAYMENT_COMPLETED
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 123,
    "patientName": "John Doe",
    "visitDate": "2024-01-15T10:30:00",
    "visitPurpose": "NEW_CONSULTATION",
    "status": "PAYMENT_COMPLETED",
    "currentStage": "TRIAGE",
    "consultationFeePaid": true,
    "consultationFeeAmount": 50.00,
    "paymentMethod": "CASH",
    "paymentReference": "REF-123456",
    "chiefComplaint": "Eye pain and blurry vision",
    "previousVisitId": null,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": null,
    "invoiceId": 1,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:35:00",
    "createdBy": "receptionist",
    "updatedBy": "cashier"
  },
  {
    "id": 3,
    "patientId": 124,
    "patientName": "Jane Smith",
    "visitDate": "2024-01-16T09:00:00",
    "visitPurpose": "NEW_CONSULTATION",
    "status": "PAYMENT_COMPLETED",
    "currentStage": "TRIAGE",
    "consultationFeePaid": true,
    "consultationFeeAmount": 50.00,
    "paymentMethod": "MOBILE_MONEY",
    "paymentReference": "MM-789012",
    "chiefComplaint": "Blurry vision",
    "previousVisitId": null,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": null,
    "invoiceId": 2,
    "createdAt": "2024-01-16T09:00:00",
    "updatedAt": "2024-01-16T09:15:00",
    "createdBy": "receptionist",
    "updatedBy": "cashier"
  }
]
```

### 7. Get Visit Sessions by Stage
```http
GET /api/patient-visit-sessions/stage/TRIAGE
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 123,
    "patientName": "John Doe",
    "visitDate": "2024-01-15T10:30:00",
    "visitPurpose": "NEW_CONSULTATION",
    "status": "PAYMENT_COMPLETED",
    "currentStage": "TRIAGE",
    "consultationFeePaid": true,
    "consultationFeeAmount": 50.00,
    "paymentMethod": "CASH",
    "paymentReference": "REF-123456",
    "chiefComplaint": "Eye pain and blurry vision",
    "previousVisitId": null,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": null,
    "invoiceId": 1,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:35:00",
    "createdBy": "receptionist",
    "updatedBy": "cashier"
  }
]
```

### 8. Error Responses

**Patient Not Found:**
```json
{
  "status": "error",
  "message": "Patient not found with ID: 999",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions"
}
```

**Visit Session Not Found:**
```json
{
  "status": "error",
  "message": "Visit session not found with ID: 999",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/999/mark-fee-paid"
}
```

**Invalid Stage Progression:**
```json
{
  "status": "error",
  "message": "Cannot progress from COMPLETED stage",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/1/progress-stage"
}
```

**Payment Already Made:**
```json
{
  "status": "error",
  "message": "Consultation fee already paid for visit session ID: 1",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/1/mark-fee-paid"
}
```

## Workflow Examples

### New Consultation Workflow

1. **Reception** (Stage: RECEPTION)
   ```json
   {
     "patientId": 123,
     "visitPurpose": "NEW_CONSULTATION",
     "chiefComplaint": "Eye pain"
   }
   ```
   - Visit session created
   - Invoice automatically created
   - Stage: RECEPTION → CASHIER

2. **Cashier** (Stage: CASHIER)
   ```json
   PUT /api/patient-visit-sessions/1/mark-fee-paid
   {
     "paymentMethod": "CASH",
     "paymentReference": "REF-123"
   }
   ```
   - Payment recorded
   - Invoice marked as paid
   - Stage: CASHIER → TRIAGE

3. **Triage** (Stage: TRIAGE)
   ```json
   PUT /api/patient-visit-sessions/1/progress-stage
   ```
   - Triage measurements completed
   - Stage: TRIAGE → DOCTOR_VISIT

4. **Doctor Visit** (Stage: DOCTOR_VISIT)
   ```json
   PUT /api/patient-visit-sessions/1/progress-stage
   ```
   - Doctor examination completed
   - Stage: DOCTOR_VISIT → PHARMACY

5. **Pharmacy** (Stage: PHARMACY)
   ```json
   PUT /api/patient-visit-sessions/1/progress-stage
   ```
   - Medication dispensed
   - Stage: PHARMACY → COMPLETED

## Service Layer Changes

### PatientVisitSessionService
- **Automatic Invoice Creation**: Creates invoice for new consultations
- **Stage Progression**: Handles movement between stages
- **Payment Processing**: Marks fees as paid and updates stages

### InvoiceService (New)
- **createConsultationInvoice()**: Creates automatic invoice
- **markInvoiceAsPaid()**: Updates invoice payment status
- **generateInvoiceNumber()**: Creates unique invoice numbers

## DTO Updates

### PatientVisitSessionDto
```java
private String currentStage; // Added field
```

### CreatePatientVisitSessionRequest
```java
private String currentStage; // Added field
```

## Database Migration

### V13__add_visit_stage_tracking.sql
- Adds `current_stage` column
- Creates index for performance
- Updates existing records with proper stages

## Error Handling

### Invoice Creation Failures
- Logs error but continues visit session creation
- Invoice can be created manually later
- Visit session remains functional

### Stage Progression Validation
- Validates current stage before progression
- Prevents invalid stage transitions
- Provides clear error messages

## Security Considerations

### Authorization
- **RECEPTIONIST**: Can create visits and mark payments
- **DOCTOR**: Can progress through medical stages
- **ADMIN**: Full access to all operations

### Data Integrity
- Stage progression is atomic
- Payment status is validated
- Invoice-visit session relationship is maintained

## Testing Scenarios

### 1. New Consultation Flow
```bash
# Create visit session
curl -X POST http://localhost:8080/api/patient-visit-sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "visitPurpose": "NEW_CONSULTATION",
    "chiefComplaint": "Eye pain"
  }'

# Mark fee as paid
curl -X PUT http://localhost:8080/api/patient-visit-sessions/1/mark-fee-paid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "CASH",
    "paymentReference": "REF-123"
  }'

# Progress to next stage
curl -X PUT http://localhost:8080/api/patient-visit-sessions/1/progress-stage \
  -H "Authorization: Bearer <token>"
```

### 2. Non-Consultation Visits
```bash
# Create follow-up visit (no automatic invoice)
curl -X POST http://localhost:8080/api/patient-visit-sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "visitPurpose": "FOLLOW_UP",
    "chiefComplaint": "Follow-up check"
  }'
```

## Benefits

### 1. **Automated Workflow**
- Reduces manual intervention
- Ensures consistent process
- Tracks patient progress

### 2. **Better Patient Experience**
- Clear stage progression
- Automatic invoice creation
- Streamlined payment process

### 3. **Improved Management**
- Real-time stage tracking
- Payment status visibility
- Audit trail for all actions

### 4. **Data Integrity**
- Consistent stage progression
- Proper invoice linking
- Payment status validation

## Future Enhancements

### 1. **Stage Notifications**
- SMS/Email notifications at stage changes
- Reminder for pending actions
- Completion confirmations

### 2. **Advanced Workflow**
- Conditional stage progression
- Parallel stage processing
- Stage-specific validations

### 3. **Reporting**
- Stage duration analytics
- Bottleneck identification
- Performance metrics

## Current Status

✅ **Automatic invoice creation implemented**
✅ **Stage tracking system added**
✅ **Payment processing integrated**
✅ **Database migration created**
✅ **API endpoints updated**
✅ **Service layer enhanced**
✅ **DTOs updated**

The system now provides a complete workflow management solution for patient visit sessions with automatic invoice creation and comprehensive stage tracking.

## Additional Response Examples

### Error Responses

**Patient Not Found:**
```json
{
  "status": "error",
  "message": "Patient not found with ID: 999",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions"
}
```

**Visit Session Not Found:**
```json
{
  "status": "error",
  "message": "Visit session not found with ID: 999",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/999/mark-fee-paid"
}
```

**Invalid Stage Progression:**
```json
{
  "status": "error",
  "message": "Cannot progress from COMPLETED stage",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/1/progress-stage"
}
```

**Payment Already Made:**
```json
{
  "status": "error",
  "message": "Consultation fee already paid for visit session ID: 1",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/1/mark-fee-paid"
}
```

### Get Visit Sessions by Patient ID
```http
GET /api/patient-visit-sessions/patient/{patientId}
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 123,
    "patientName": "John Doe",
    "visitDate": "2024-01-15T10:30:00",
    "visitPurpose": "NEW_CONSULTATION",
    "status": "COMPLETED",
    "currentStage": "COMPLETED",
    "consultationFeePaid": true,
    "consultationFeeAmount": 50.00,
    "paymentMethod": "CASH",
    "paymentReference": "REF-123456",
    "chiefComplaint": "Eye pain and blurry vision",
    "previousVisitId": null,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": "Medication dispensed",
    "invoiceId": 1,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T12:00:00",
    "createdBy": "receptionist",
    "updatedBy": "pharmacist"
  },
  {
    "id": 2,
    "patientId": 123,
    "patientName": "John Doe",
    "visitDate": "2024-01-20T14:00:00",
    "visitPurpose": "FOLLOW_UP",
    "status": "REGISTERED",
    "currentStage": "RECEPTION",
    "consultationFeePaid": false,
    "consultationFeeAmount": null,
    "paymentMethod": null,
    "paymentReference": null,
    "chiefComplaint": "Follow-up check",
    "previousVisitId": 1,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": null,
    "invoiceId": null,
    "createdAt": "2024-01-20T14:00:00",
    "updatedAt": "2024-01-20T14:00:00",
    "createdBy": "receptionist",
    "updatedBy": "receptionist"
  }
]
```

### Get Visit Sessions by Status
```http
GET /api/patient-visit-sessions/status/PAYMENT_COMPLETED
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 123,
    "patientName": "John Doe",
    "visitDate": "2024-01-15T10:30:00",
    "visitPurpose": "NEW_CONSULTATION",
    "status": "PAYMENT_COMPLETED",
    "currentStage": "TRIAGE",
    "consultationFeePaid": true,
    "consultationFeeAmount": 50.00,
    "paymentMethod": "CASH",
    "paymentReference": "REF-123456",
    "chiefComplaint": "Eye pain and blurry vision",
    "previousVisitId": null,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": null,
    "invoiceId": 1,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:35:00",
    "createdBy": "receptionist",
    "updatedBy": "cashier"
  },
  {
    "id": 3,
    "patientId": 124,
    "patientName": "Jane Smith",
    "visitDate": "2024-01-16T09:00:00",
    "visitPurpose": "NEW_CONSULTATION",
    "status": "PAYMENT_COMPLETED",
    "currentStage": "TRIAGE",
    "consultationFeePaid": true,
    "consultationFeeAmount": 50.00,
    "paymentMethod": "MOBILE_MONEY",
    "paymentReference": "MM-789012",
    "chiefComplaint": "Blurry vision",
    "previousVisitId": null,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": null,
    "invoiceId": 2,
    "createdAt": "2024-01-16T09:00:00",
    "updatedAt": "2024-01-16T09:15:00",
    "createdBy": "receptionist",
    "updatedBy": "cashier"
  }
]
```

### Get Visit Sessions by Stage
```http
GET /api/patient-visit-sessions/stage/TRIAGE
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 123,
    "patientName": "John Doe",
    "visitDate": "2024-01-15T10:30:00",
    "visitPurpose": "NEW_CONSULTATION",
    "status": "PAYMENT_COMPLETED",
    "currentStage": "TRIAGE",
    "consultationFeePaid": true,
    "consultationFeeAmount": 50.00,
    "paymentMethod": "CASH",
    "paymentReference": "REF-123456",
    "chiefComplaint": "Eye pain and blurry vision",
    "previousVisitId": null,
    "emergencyLevel": "NONE",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false,
    "notes": null,
    "invoiceId": 1,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:35:00",
    "createdBy": "receptionist",
    "updatedBy": "cashier"
  }
]
``` 