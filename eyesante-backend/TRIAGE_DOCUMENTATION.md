# Triage System Documentation

## Overview
The triage system handles patient vital signs measurement and initial assessment during patient visits.

## Core Components

### TriageMeasurement Entity
- Stores vital signs (BP, RBS, IOP, weight)
- Links to PatientVisitSession
- Includes audit fields (created/updated by/at)

### API Endpoints

#### Create Triage
```
POST /api/triage-measurements
{
  "patientVisitSessionId": 1,
  "bloodPressure": "120/80",
  "randomBloodSugar": 95.5,
  "intraocularPressure": 16.0,
  "weight": 70.5,
  "notes": "Patient stable"
}
```

#### Get Triage
```
GET /api/triage-measurements/{id}
GET /api/triage-measurements/visit-session/{visitSessionId}
```

#### Update/Delete
```
PUT /api/triage-measurements/{id}
DELETE /api/triage-measurements/{id}
```

## Workflow Integration

### Visit Stages
1. RECEPTION → Patient registered
2. CASHIER → Payment processed  
3. **TRIAGE** → Vital signs measured
4. DOCTOR_VISIT → Doctor examination
5. PHARMACY → Medication dispensed
6. COMPLETED → Visit finished

### Automatic Progression
When triage is completed, visit session automatically progresses to next stage.

## Emergency Triage

### Emergency Levels
- CRITICAL: Immediate attention
- URGENT: Within 1 hour
- SEMI_URGENT: Within 4 hours  
- NON_URGENT: Routine care

### Emergency Workflow
1. Visit marked as EMERGENCY
2. Priority level assigned
3. Fast-track processing
4. Critical vital signs measured

## Business Rules

### Validation
- Blood Pressure: "systolic/diastolic" format
- Blood Sugar: 0-1000 mg/dL range
- IOP: 0-50 mmHg range
- Weight: 0-500 kg range

### Access Control
- RECEPTIONIST: Create/view
- NURSE: Create/update/view
- DOCTOR: View only
- ADMIN/SUPER_ADMIN: Full access

## Integration

### With Patient Visit Sessions
- One triage per visit session
- Automatic stage progression
- Emergency bypass capability

### With Doctor Recommendations
- Triage data available to doctors
- Influences treatment decisions
- Historical triage tracking

## Testing

### Test Commands
```bash
# Create triage
curl -X POST http://localhost:8080/api/triage-measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"patientVisitSessionId": 1, "bloodPressure": "120/80"}'

# Get triage
curl -X GET http://localhost:8080/api/triage-measurements/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Error Handling

### Common Errors
- Duplicate triage for visit session
- Invalid vital signs ranges
- Missing required fields
- Insufficient permissions

### Error Response
```json
{
  "error": "Validation Error",
  "message": "Blood pressure format invalid",
  "timestamp": "2025-01-15T10:30:00"
}
```

## Security & Audit

### Audit Trail
- All operations logged
- User tracking (created/updated by)
- Timestamp tracking
- Data encryption

### Data Privacy
- Sensitive medical information
- Role-based access control
- Secure transmission

## Performance

### Database Indexing
```sql
CREATE INDEX idx_triage_visit_session ON triage_measurements(patient_visit_session_id);
CREATE INDEX idx_triage_measurement_date ON triage_measurements(measurement_date);
```

### Caching
- Cache active triage data
- Invalidate on updates
- Redis for distributed caching

## Troubleshooting

### Common Issues
1. Triage not saving - Check constraints/permissions
2. Stage not progressing - Verify triage completion
3. Data not displaying - Check authentication/relationships

### Debug Commands
```bash
# Check triage data
curl -X GET http://localhost:8080/api/triage-measurements

# Check visit session status  
curl -X GET http://localhost:8080/api/patient-visit-sessions/1

# Database check
psql -d eyesante_db -c "SELECT * FROM triage_measurements;"
``` 