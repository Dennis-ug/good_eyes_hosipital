# Basic Refraction Exam Quick Reference

## API Endpoints

### Create Exam
```bash
POST /api/basic-refraction-exams
{
  "visitSessionId": 1,
  "neuroOriented": true,
  "visualAcuityDistanceScRight": "20/20",
  "manifestAutoRightSphere": -1.25
}
```

### Get by ID
```bash
GET /api/basic-refraction-exams/{id}
```

### Get by Visit Session
```bash
GET /api/basic-refraction-exams/visit-session/{visitSessionId}
```

### Update Exam
```bash
PUT /api/basic-refraction-exams/{id}
```

### Delete Exam
```bash
DELETE /api/basic-refraction-exams/{id}
```

### Get All
```bash
GET /api/basic-refraction-exams
```

## Key Fields

### Required
- **visitSessionId**: Links to patient visit session

### Neuro/Psych
- **neuroOriented**: Boolean
- **neuroMood**: String

### Pupils
- **pupilsPerrl**: Boolean (PERRL)
- **pupilsRightDark/LeftDark**: String
- **pupilsRightLight/LeftLight**: String

### Visual Acuity
- **visualAcuityDistanceScRight/Left**: String (e.g., "20/20")
- **visualAcuityDistanceCcRight/Left**: String
- **visualAcuityNearScRight/Left**: String (e.g., "J1")

### Refraction
- **manifestAutoRight/LeftSphere**: Double
- **manifestAutoRight/LeftCylinder**: Double
- **manifestAutoRight/LeftAxis**: Integer (0-180)

## Workflow Integration

### Stage: BASIC_REFRACTION_EXAM
- **Precedes**: DOCTOR_VISIT
- **Follows**: TRIAGE
- **Status**: TRIAGE_COMPLETED → BASIC_REFRACTION_COMPLETED

### Progression
```bash
# Progress to basic refraction exam
POST /api/patient-visit-sessions/{id}/progress
```

## Access Control

### Create/Update
- DOCTOR, OPHTHALMOLOGIST, OPTOMETRIST, ADMIN, SUPER_ADMIN

### View Only
- RECEPTIONIST

### Delete
- ADMIN, SUPER_ADMIN

## Response Format

```json
{
  "id": 1,
  "visitSessionId": 1,
  "neuroOriented": true,
  "visualAcuityDistanceScRight": "20/20",
  "manifestAutoRightSphere": -1.25,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "examinationDate": "2025-01-15T10:30:00",
  "examinedBy": "Dr. Smith"
}
```

## Test Commands

```bash
# Run complete test
./test-basic-refraction-exam.sh

# Quick test
curl -X POST http://localhost:8080/api/basic-refraction-exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"visitSessionId": 1, "neuroOriented": true}'
```
