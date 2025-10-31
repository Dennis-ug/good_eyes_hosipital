# Triage System Quick Reference

## API Endpoints

### Create Triage
```bash
curl -X POST http://localhost:8080/api/triage-measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patientVisitSessionId": 1,
    "bloodPressure": "120/80",
    "randomBloodSugar": 95.5,
    "intraocularPressure": 16.0,
    "weight": 70.5,
    "notes": "Patient stable"
  }'
```

### Get Triage
```bash
curl -X GET http://localhost:8080/api/triage-measurements/1
curl -X GET http://localhost:8080/api/triage-measurements/visit-session/1
```

### Update Triage
```bash
curl -X PUT http://localhost:8080/api/triage-measurements/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"bloodPressure": "125/85", "notes": "Updated"}'
```

### Delete Triage
```bash
curl -X DELETE http://localhost:8080/api/triage-measurements/1
```

## Data Model

### TriageMeasurement
- id: Long (Primary Key)
- patientVisitSessionId: Long (Unique, Required)
- bloodPressure: String (Format: "systolic/diastolic")
- randomBloodSugar: BigDecimal (0-1000 mg/dL)
- intraocularPressure: BigDecimal (0-50 mmHg)
- weight: BigDecimal (0-500 kg)
- notes: String
- measuredBy: Long (User ID)
- measurementDate: LocalDateTime

## Workflow Stages
1. RECEPTION → 2. CASHIER → 3. **TRIAGE** → 4. DOCTOR_VISIT → 5. PHARMACY → 6. COMPLETED

## Emergency Levels
- CRITICAL: Immediate attention
- URGENT: Within 1 hour
- SEMI_URGENT: Within 4 hours
- NON_URGENT: Routine care

## Validation Rules
- Blood Pressure: "systolic/diastolic" format
- Blood Sugar: 0-1000 mg/dL
- IOP: 0-50 mmHg
- Weight: 0-500 kg
- One triage per visit session

## Access Control
- RECEPTIONIST: Create/View
- NURSE: Create/Update/View
- DOCTOR: View only
- ADMIN/SUPER_ADMIN: Full access
