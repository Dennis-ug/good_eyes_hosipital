# New APIs Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All APIs require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Create Patient Visit Session

### Endpoint
```http
POST /api/patient-visit-sessions
```

### Request Body
```json
{
  "patientId": 123,
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Eye pain and blurry vision",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "consultationFeeAmount": 50.00,
  "notes": "Patient reports severe eye pain"
}
```

### Response Body
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
  "notes": "Patient reports severe eye pain",
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "createdBy": "receptionist",
  "updatedBy": "receptionist"
}
```

### Notes
- For `NEW_CONSULTATION`, an invoice is automatically created
- `currentStage` starts at `RECEPTION` and progresses to `CASHIER`
- `invoiceId` is included for consultation visits

---

## 2. Mark Consultation Fee as Paid

### Endpoint
```http
PUT /api/patient-visit-sessions/{id}/mark-fee-paid
```

### Request Body
```json
{
  "paymentMethod": "CASH",
  "paymentReference": "REF-123456"
}
```

### Response Body
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
  "notes": "Patient reports severe eye pain",
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:35:00",
  "createdBy": "receptionist",
  "updatedBy": "cashier"
}
```

### Notes
- Progresses stage from `CASHIER` to `TRIAGE`
- Updates invoice payment status
- Sets `consultationFeePaid` to `true`

---

## 3. Progress to Next Stage

### Endpoint
```http
PUT /api/patient-visit-sessions/{id}/progress-stage
```

### Request Body
```
No body required
```

### Response Body (Triage to Doctor Visit)
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
  "notes": "Triage measurements completed",
  "invoiceId": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:00:00",
  "createdBy": "receptionist",
  "updatedBy": "nurse"
}
```

### Response Body (Doctor Visit to Pharmacy)
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

### Response Body (Pharmacy to Completed)
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

### Notes
- Automatically progresses to next logical stage
- Updates status based on new stage
- Cannot progress from `COMPLETED` stage

---

## 4. Get Visit Session by ID

### Endpoint
```http
GET /api/patient-visit-sessions/{id}
```

### Request Body
```
No body required
```

### Response Body
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

---

## 5. Get Visit Sessions by Patient ID

### Endpoint
```http
GET /api/patient-visit-sessions/patient/{patientId}
```

### Request Body
```
No body required
```

### Response Body
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

---

## 6. Get Visit Sessions by Status

### Endpoint
```http
GET /api/patient-visit-sessions/status/{status}
```

### Request Body
```
No body required
```

### Response Body
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

---

## 7. Get Visit Sessions by Stage

### Endpoint
```http
GET /api/patient-visit-sessions/stage/{stage}
```

### Request Body
```
No body required
```

### Response Body
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

---

## Error Responses

### Patient Not Found
```json
{
  "status": "error",
  "message": "Patient not found with ID: 999",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions"
}
```

### Visit Session Not Found
```json
{
  "status": "error",
  "message": "Visit session not found with ID: 999",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/999/mark-fee-paid"
}
```

### Invalid Stage Progression
```json
{
  "status": "error",
  "message": "Cannot progress from COMPLETED stage",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/1/progress-stage"
}
```

### Payment Already Made
```json
{
  "status": "error",
  "message": "Consultation fee already paid for visit session ID: 1",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/1/mark-fee-paid"
}
```

---

## Data Types

### Visit Purpose
- `NEW_CONSULTATION`
- `FOLLOW_UP`
- `MEDICATION_REFILL`
- `REVIEW`
- `EMERGENCY`
- `SURGERY`
- `ROUTINE_CHECKUP`
- `COMPLAINT_VISIT`

### Visit Status
- `REGISTERED`
- `INVOICE_CREATED`
- `PAYMENT_PENDING`
- `PAYMENT_COMPLETED`
- `TRIAGE_COMPLETED`
- `DOCTOR_VISIT_COMPLETED`
- `MEDICATION_DISPENSED`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

### Current Stage
- `RECEPTION`
- `CASHIER`
- `TRIAGE`
- `DOCTOR_VISIT`
- `PHARMACY`
- `COMPLETED`

### Payment Method
- `CASH`
- `MOBILE_MONEY`
- `BANK_TRANSFER`
- `CARD`
- `INSURANCE`
- `CHEQUE`

### Emergency Level
- `NONE`
- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL` 