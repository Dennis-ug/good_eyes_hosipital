# API Quick Reference Card

## Authentication
```bash
POST /api/auth/login
{"username": "superadmin", "password": "admin123"}
```

## Patient Management
```bash
POST   /api/patients                    # Create patient
GET    /api/patients/{id}               # Get patient by ID
GET    /api/patients                    # Get all patients
PUT    /api/patients/{id}               # Update patient
DELETE /api/patients/{id}               # Delete patient
```

## Patient Visit Sessions
```bash
POST   /api/patient-visit-sessions                    # Create visit session
GET    /api/patient-visit-sessions/{id}               # Get visit session
GET    /api/patient-visit-sessions                    # Get all visit sessions
PUT    /api/patient-visit-sessions/{id}               # Update visit session
DELETE /api/patient-visit-sessions/{id}               # Delete visit session
POST   /api/patient-visit-sessions/{id}/progress      # Progress to next stage
POST   /api/patient-visit-sessions/{id}/mark-paid     # Mark payment completed
```

## Triage Measurements
```bash
POST   /api/triage-measurements                    # Create triage
GET    /api/triage-measurements/{id}               # Get triage by ID
GET    /api/triage-measurements/visit-session/{id} # Get triage by visit session
GET    /api/triage-measurements                    # Get all triage measurements
PUT    /api/triage-measurements/{id}               # Update triage
DELETE /api/triage-measurements/{id}               # Delete triage
```

## Basic Refraction Exams
```bash
POST   /api/basic-refraction-exams                    # Create exam
GET    /api/basic-refraction-exams/{id}               # Get exam by ID
GET    /api/basic-refraction-exams/visit-session/{id} # Get exam by visit session
GET    /api/basic-refraction-exams                    # Get all exams
PUT    /api/basic-refraction-exams/{id}               # Update exam
DELETE /api/basic-refraction-exams/{id}               # Delete exam
```

## Workflow Stages
1. **RECEPTION** → Patient registered
2. **CASHIER** → Payment processed
3. **TRIAGE** → Vital signs measured
4. **BASIC_REFRACTION_EXAM** → Basic refraction examination
5. **DOCTOR_VISIT** → Doctor examination
6. **PHARMACY** → Medication dispensed
7. **COMPLETED** → Visit finished

## Key Features
- ✅ **Patient details** included in all responses
- ✅ **Payment validation** before triage
- ✅ **Stage progression** with status updates
- ✅ **One-to-one relationships** (triage, basic refraction per visit)
- ✅ **Role-based access control**
- ✅ **Complete audit trail**

## Test Scripts
```bash
./test-basic-refraction-exam.sh      # Complete workflow test
./test-triage-fix.sh                 # Triage API test
./test-workflow-enhancement.sh       # Workflow progression test
```

## Common Headers
```bash
-H "Content-Type: application/json"
-H "Authorization: Bearer $TOKEN"
```

## Base URL
```
http://localhost:8080/api
```
