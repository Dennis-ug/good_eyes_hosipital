# Complete API Documentation - Eyesante Backend

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Patient Management APIs](#patient-management-apis)
3. [Patient Visit Session APIs](#patient-visit-session-apis)
4. [Triage Measurement APIs](#triage-measurement-apis)
5. [Basic Refraction Exam APIs](#basic-refraction-exam-apis)
6. [Invoice Management APIs](#invoice-management-apis)
7. [Inventory Management APIs](#inventory-management-apis)

---

## Authentication APIs

### Login
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "superadmin",
    "email": "admin@eyesante.com",
    "role": "SUPER_ADMIN"
  }
}
```

---

## Patient Management APIs

### Create Patient
**Endpoint**: `POST /api/patients`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "nationalId": "123456789012345",
  "dateOfBirth": "1990-01-01",
  "ageInYears": 33,
  "phone": "1234567890",
  "residence": "Nairobi, Kenya"
}
```

**Response**:
```json
{
  "id": 1,
  "patientNumber": "ESP-000001",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "nationalId": "123456789012345",
  "dateOfBirth": "1990-01-01",
  "ageInYears": 33,
  "phone": "1234567890",
  "residence": "Nairobi, Kenya",
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

### Get Patient by ID
**Endpoint**: `GET /api/patients/{id}`

### Get All Patients
**Endpoint**: `GET /api/patients`

### Update Patient
**Endpoint**: `PUT /api/patients/{id}`

### Delete Patient
**Endpoint**: `DELETE /api/patients/{id}`

### Test Patient Number Generation
**Endpoint**: `POST /api/patients/test-patient-number-generation`

---

## Patient Visit Session APIs

### Create Visit Session
**Endpoint**: `POST /api/patient-visit-sessions`

**Request Body**:
```json
{
  "patientId": 1,
  "visitPurpose": "CONSULTATION",
  "consultationFee": 50.00,
  "notes": "Regular checkup"
}
```

**Response**:
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "visitPurpose": "CONSULTATION",
  "currentStage": "RECEPTION",
  "status": "REGISTERED",
  "consultationFee": 50.00,
  "consultationFeePaid": false,
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

### Get Visit Session by ID
**Endpoint**: `GET /api/patient-visit-sessions/{id}`

### Get All Visit Sessions
**Endpoint**: `GET /api/patient-visit-sessions`

### Update Visit Session
**Endpoint**: `PUT /api/patient-visit-sessions/{id}`

### Delete Visit Session
**Endpoint**: `DELETE /api/patient-visit-sessions/{id}`

### Progress to Next Stage
**Endpoint**: `POST /api/patient-visit-sessions/{id}/progress`

### Mark Payment as Completed
**Endpoint**: `POST /api/patient-visit-sessions/{id}/mark-paid`

---

## Triage Measurement APIs

### Create Triage Measurement
**Endpoint**: `POST /api/triage-measurements`

**Request Body**:
```json
{
  "visitSessionId": 1,
  "systolicBp": 120,
  "diastolicBp": 80,
  "rbsValue": 95.5,
  "rbsUnit": "mg/dL",
  "iopRight": 16.0,
  "iopLeft": 16.0,
  "weightKg": 70.5,
  "weightLbs": 155.4,
  "notes": "Patient stable",
  "measuredBy": "Nurse Smith"
}
```

**Response**:
```json
{
  "id": 1,
  "visitSessionId": 1,
  "systolicBp": 120,
  "diastolicBp": 80,
  "rbsValue": 95.5,
  "rbsUnit": "mg/dL",
  "iopRight": 16.0,
  "iopLeft": 16.0,
  "weightKg": 70.5,
  "weightLbs": 155.4,
  "notes": "Patient stable",
  "measuredBy": "Nurse Smith",
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "measurementDate": "2025-01-15T10:30:00",
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

### Get Triage Measurement by ID
**Endpoint**: `GET /api/triage-measurements/{id}`

### Get Triage Measurement by Visit Session
**Endpoint**: `GET /api/triage-measurements/visit-session/{visitSessionId}`

### Get All Triage Measurements
**Endpoint**: `GET /api/triage-measurements`

### Update Triage Measurement
**Endpoint**: `PUT /api/triage-measurements/{id}`

### Delete Triage Measurement
**Endpoint**: `DELETE /api/triage-measurements/{id}`

---

## Basic Refraction Exam APIs

### Create Basic Refraction Exam
**Endpoint**: `POST /api/basic-refraction-exams`

**Request Body**:
```json
{
  "visitSessionId": 1,
  "neuroOriented": true,
  "neuroMood": "Alert and cooperative",
  "pupilsPerrl": true,
  "pupilsRightDark": "4mm",
  "pupilsRightLight": "2mm",
  "pupilsLeftDark": "4mm",
  "pupilsLeftLight": "2mm",
  "visualAcuityDistanceScRight": "20/25",
  "visualAcuityDistanceScLeft": "20/30",
  "visualAcuityDistanceCcRight": "20/20",
  "visualAcuityDistanceCcLeft": "20/20",
  "manifestAutoRightSphere": -1.50,
  "manifestAutoRightCylinder": -0.75,
  "manifestAutoRightAxis": 90,
  "manifestAutoLeftSphere": -1.25,
  "manifestAutoLeftCylinder": -0.50,
  "manifestAutoLeftAxis": 85,
  "comment": "Patient shows moderate myopia with astigmatism"
}
```

**Response**:
```json
{
  "id": 1,
  "visitSessionId": 1,
  "neuroOriented": true,
  "neuroMood": "Alert and cooperative",
  "pupilsPerrl": true,
  "visualAcuityDistanceScRight": "20/25",
  "visualAcuityDistanceScLeft": "20/30",
  "manifestAutoRightSphere": -1.50,
  "manifestAutoRightCylinder": -0.75,
  "manifestAutoRightAxis": 90,
  "comment": "Patient shows moderate myopia with astigmatism",
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "examinationDate": "2025-01-15T10:30:00",
  "examinedBy": "Dr. Smith",
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

### Get Basic Refraction Exam by ID
**Endpoint**: `GET /api/basic-refraction-exams/{id}`

### Get Basic Refraction Exam by Visit Session
**Endpoint**: `GET /api/basic-refraction-exams/visit-session/{visitSessionId}`

### Get All Basic Refraction Exams
**Endpoint**: `GET /api/basic-refraction-exams`

### Update Basic Refraction Exam
**Endpoint**: `PUT /api/basic-refraction-exams/{id}`

### Delete Basic Refraction Exam
**Endpoint**: `DELETE /api/basic-refraction-exams/{id}`

---

## Workflow Integration

### Patient Visit Workflow Stages

1. **RECEPTION** → Patient registered
2. **CASHIER** → Payment processed
3. **TRIAGE** → Vital signs measured
4. **BASIC_REFRACTION_EXAM** → Basic refraction examination
5. **DOCTOR_VISIT** → Doctor examination
6. **PHARMACY** → Medication dispensed
7. **COMPLETED** → Visit finished

### Business Rules

1. **Payment Validation**: Cannot proceed to triage without payment completion
2. **Stage Progression**: Each stage must be completed before moving to next
3. **One-to-One Relationships**: Each visit session can have one triage measurement and one basic refraction exam
4. **Patient Details**: All responses include patient name and phone number
5. **Audit Trail**: All operations are tracked with timestamps and user information

---

## Security & Access Control

### Role-Based Permissions

| Role | Patient | Visit Session | Triage | Basic Refraction | Invoice | Drugs |
|------|---------|---------------|--------|------------------|---------|-------|
| SUPER_ADMIN | Full | Full | Full | Full | Full | Full |
| ADMIN | Full | Full | Full | Full | Full | Full |
| DOCTOR | Read | Read | Create/Update/Read | Create/Update/Read | Read | Read |
| OPHTHALMOLOGIST | Read | Read | Create/Update/Read | Create/Update/Read | Read | Read |
| OPTOMETRIST | Read | Read | Create/Update/Read | Create/Update/Read | Read | Read |
| RECEPTIONIST | Create/Update/Read | Create/Update/Read | Read | Read | Read | Read |

### Authentication
- All APIs require JWT token authentication
- Token obtained via `/api/auth/login`
- Include token in Authorization header: `Bearer <token>`

---

## Testing

### Test Scripts Available

1. **`test-basic-refraction-exam.sh`** - Complete workflow testing
2. **`test-triage-fix.sh`** - Triage API testing
3. **`test-workflow-enhancement.sh`** - Workflow progression testing

### Quick Test Commands

```bash
# Test patient creation
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"firstName":"Test","lastName":"Patient","gender":"Male","nationalId":"TEST123","dateOfBirth":"1990-01-01","ageInYears":33,"phone":"1234567890","residence":"Test City"}'

# Test visit session creation
curl -X POST http://localhost:8080/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"patientId":1,"visitPurpose":"CONSULTATION","consultationFee":50.00}'

# Test triage measurement
curl -X POST http://localhost:8080/api/triage-measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"visitSessionId":1,"systolicBp":120,"diastolicBp":80,"rbsValue":95.5,"iopRight":16,"iopLeft":16,"weightKg":70.5}'

# Test basic refraction exam
curl -X POST http://localhost:8080/api/basic-refraction-exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"visitSessionId":1,"neuroOriented":true,"visualAcuityDistanceScRight":"20/20","manifestAutoRightSphere":-1.25}'
```

---

## Error Handling

### Common Error Responses

#### Validation Error
```json
{
  "error": "Validation Error",
  "message": "Visit session not found with ID: 999",
  "timestamp": "2025-01-15T10:30:00",
  "path": "/api/triage-measurements"
}
```

#### Authentication Error
```json
{
  "error": "Unauthorized",
  "message": "Access denied",
  "timestamp": "2025-01-15T10:30:00",
  "path": "/api/patients"
}
```

#### Workflow Error
```json
{
  "error": "Workflow Error",
  "message": "Cannot proceed to triage: Consultation fee not paid",
  "timestamp": "2025-01-15T10:30:00",
  "path": "/api/patient-visit-sessions/1/progress"
}
```

---

## Performance Considerations

### Database Optimizations
- Fetch joins for patient details
- Indexed foreign key relationships
- Optimized queries to prevent N+1 problems

### Response Enhancements
- Patient details included in all relevant responses
- Structured JSON responses
- Efficient data loading

---

## Support & Documentation

### Additional Documentation
- `BASIC_REFRACTION_EXAM_API_DOCUMENTATION.md` - Detailed basic refraction exam docs
- `TRIAGE_DOCS.md` - Comprehensive triage system documentation
- `WORKFLOW_ENHANCEMENT.md` - Workflow integration details

---

*Last Updated: January 15, 2025*
*Version: 1.0*
