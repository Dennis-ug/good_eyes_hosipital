# Patient Visit Session API Documentation

## Overview
Comprehensive API for managing patient visit sessions, including registration, triage, examinations, and follow-up workflows.

## Base URL
```
http://localhost:5025/api/patient-visit-sessions
```

## Authentication
```
Authorization: Bearer <jwt_token>
```

---

## API Endpoints

### 1. Create Visit Session
```http
POST /api/patient-visit-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": 123,
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Eye pain and blurry vision",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "consultationFeePaid": false,
  "consultationFeeAmount": 50.00,
  "paymentMethod": "CASH",
  "notes": "Patient reports severe eye pain"
}
```

**Roles**: RECEPTIONIST, ADMIN, SUPER_ADMIN

### 2. Get Visit Session by ID
```http
GET /api/patient-visit-sessions/{id}
Authorization: Bearer <token>
```

**Roles**: DOCTOR, OPHTHALMOLOGIST, OPTOMETRIST, RECEPTIONIST, ADMIN, SUPER_ADMIN

### 3. Get All Visit Sessions
```http
GET /api/patient-visit-sessions?page=0&size=20
Authorization: Bearer <token>
```

**Roles**: ADMIN, SUPER_ADMIN

### 4. Get Visit Sessions by Patient ID
```http
GET /api/patient-visit-sessions/patient/{patientId}
Authorization: Bearer <token>
```

**Roles**: DOCTOR, OPHTHALMOLOGIST, OPTOMETRIST, RECEPTIONIST, ADMIN, SUPER_ADMIN

### 5. Get Visit Sessions by Status
```http
GET /api/patient-visit-sessions/status/{status}
Authorization: Bearer <token>
```

**Roles**: DOCTOR, OPHTHALMOLOGIST, OPTOMETRIST, RECEPTIONIST, ADMIN, SUPER_ADMIN

### 6. Get Visit Sessions by Purpose
```http
GET /api/patient-visit-sessions/purpose/{purpose}
Authorization: Bearer <token>
```

**Roles**: DOCTOR, OPHTHALMOLOGIST, OPTOMETRIST, RECEPTIONIST, ADMIN, SUPER_ADMIN

### 7. Update Visit Session
```http
PUT /api/patient-visit-sessions/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitPurpose": "FOLLOW_UP",
  "chiefComplaint": "Follow-up for previous treatment",
  "previousVisitId": 1,
  "emergencyLevel": "NONE",
  "requiresTriage": false,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": "Patient returning for follow-up"
}
```

**Roles**: RECEPTIONIST, ADMIN, SUPER_ADMIN

### 8. Update Visit Session Status
```http
PUT /api/patient-visit-sessions/{id}/status?status=PAYMENT_COMPLETED
Authorization: Bearer <token>
```

**Roles**: DOCTOR, OPHTHALMOLOGIST, OPTOMETRIST, RECEPTIONIST, ADMIN, SUPER_ADMIN

### 9. Complete Visit Session
```http
PUT /api/patient-visit-sessions/{id}/complete
Authorization: Bearer <token>
```

**Roles**: DOCTOR, OPHTHALMOLOGIST, OPTOMETRIST, ADMIN, SUPER_ADMIN

### 10. Cancel Visit Session
```http
PUT /api/patient-visit-sessions/{id}/cancel?reason=Patient requested cancellation
Authorization: Bearer <token>
```

**Roles**: RECEPTIONIST, ADMIN, SUPER_ADMIN

### 11. Mark Visit as No-Show
```http
PUT /api/patient-visit-sessions/{id}/no-show
Authorization: Bearer <token>
```

**Roles**: RECEPTIONIST, ADMIN, SUPER_ADMIN

### 12. Delete Visit Session
```http
DELETE /api/patient-visit-sessions/{id}
Authorization: Bearer <token>
```

**Roles**: ADMIN, SUPER_ADMIN

### 13. Get Visit Session Statistics
```http
GET /api/patient-visit-sessions/statistics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Roles**: ADMIN, SUPER_ADMIN

### 14. Search Visit Sessions
```http
GET /api/patient-visit-sessions/search?patientName=John&status=COMPLETED&purpose=NEW_CONSULTATION&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Roles**: DOCTOR, OPHTHALMOLOGIST, OPTOMETRIST, RECEPTIONIST, ADMIN, SUPER_ADMIN

---

## Response Format

### Success Response
```json
{
  "id": 1,
  "patientId": 123,
  "patientName": "John Doe",
  "visitDate": "2024-01-15T09:00:00",
  "visitPurpose": "NEW_CONSULTATION",
  "status": "REGISTERED",
  "consultationFeePaid": false,
  "consultationFeeAmount": 50.00,
  "paymentMethod": "CASH",
  "paymentReference": null,
  "chiefComplaint": "Eye pain and blurry vision",
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": "Patient reports severe eye pain",
  "invoiceId": null,
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:00:00",
  "createdBy": "receptionist@clinic.com",
  "updatedBy": "receptionist@clinic.com"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Visit session not found with ID: 999",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/999"
}
```

---

## Data Models

### Visit Purpose Enum
- `NEW_CONSULTATION` - First-time patient consultation
- `FOLLOW_UP` - Follow-up visit for existing patient
- `MEDICATION_REFILL` - Visit for medication refill
- `REVIEW` - Treatment review visit
- `EMERGENCY` - Emergency visit
- `SURGERY` - Surgical procedure visit
- `ROUTINE_CHECKUP` - Routine health checkup
- `COMPLAINT_VISIT` - Visit for specific complaint

### Visit Status Enum
- `REGISTERED` - Patient registered, waiting for payment
- `PAYMENT_COMPLETED` - Payment completed, waiting for triage
- `TRIAGE_COMPLETED` - Triage completed, waiting for doctor
- `DOCTOR_VISIT_COMPLETED` - Doctor examination completed
- `COMPLETED` - Visit fully completed
- `MEDICATION_DISPENSED` - Medication dispensed
- `CANCELLED` - Visit cancelled
- `NO_SHOW` - Patient did not show up

### Emergency Level Enum
- `NONE` - No emergency
- `LOW` - Low priority emergency
- `MEDIUM` - Medium priority emergency
- `HIGH` - High priority emergency
- `CRITICAL` - Critical emergency

### Payment Method Enum
- `CASH` - Cash payment
- `CARD` - Card payment
- `MOBILE_MONEY` - Mobile money payment
- `INSURANCE` - Insurance payment

---

## Workflow Examples

### New Consultation Workflow
1. Create Visit Session (POST)
2. Complete Payment (PUT status=PAYMENT_COMPLETED)
3. Complete Triage (PUT status=TRIAGE_COMPLETED)
4. Complete Doctor Visit (PUT status=DOCTOR_VISIT_COMPLETED)
5. Complete Visit (PUT /complete)

### Follow-up Workflow
1. Create Visit Session with previousVisitId and visitPurpose: FOLLOW_UP
2. Update Status as needed through the workflow
3. Complete Visit when finished

### Emergency Workflow
1. Create Visit Session with isEmergency: true and emergencyLevel: HIGH
2. Skip Payment if necessary
3. Immediate Doctor Visit (PUT status=DOCTOR_VISIT_COMPLETED)
4. Complete Visit when stabilized

---

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patientId` | Long | Yes | ID of the patient |
| `visitPurpose` | String | Yes | Purpose of visit |
| `chiefComplaint` | String | No | Main complaint or reason for visit |
| `requiresTriage` | Boolean | No | Whether triage is required |
| `requiresDoctorVisit` | Boolean | No | Whether doctor examination is required |
| `isEmergency` | Boolean | No | Whether this is an emergency visit |
| `consultationFeePaid` | Boolean | No | Whether consultation fee has been paid |
| `consultationFeeAmount` | Double | No | Amount of consultation fee |
| `paymentMethod` | String | No | Payment method |
| `notes` | String | No | Additional notes |
| `previousVisitId` | Long | No | ID of previous visit |
| `emergencyLevel` | String | No | Emergency level |

---

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | No | 0 | Page number (0-based) |
| `size` | Integer | No | 20 | Number of items per page |
| `status` | String | Yes | - | Visit status filter |
| `purpose` | String | Yes | - | Visit purpose filter |
| `patientName` | String | No | - | Patient name to search |
| `startDate` | String | No | - | Start date (YYYY-MM-DD) |
| `endDate` | String | No | - | End date (YYYY-MM-DD) |

---

## Error Codes

- `404 Not Found` - Visit session not found
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Server error

---

## Best Practices

1. **Validation**: Always validate input data
2. **Error Handling**: Provide meaningful error messages
3. **Logging**: Log all operations for audit trail
4. **Security**: Use proper authentication and authorization
5. **Performance**: Use pagination for large datasets
6. **Testing**: Test all endpoints thoroughly
7. **Monitoring**: Monitor API usage and performance

This API provides complete management of patient visit sessions with proper workflow support and role-based access control. 