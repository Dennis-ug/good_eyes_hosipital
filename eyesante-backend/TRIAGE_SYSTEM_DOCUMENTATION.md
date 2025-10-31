# Triage System Documentation

## Overview

The triage system is a critical component of the patient visit workflow that handles initial patient assessment, vital signs measurement, and prioritization of care. It's integrated into the patient visit session workflow and supports both emergency and routine patient visits.

## System Architecture

### Core Components

1. **TriageMeasurement Entity** - Stores vital signs and assessment data
2. **PatientVisitSession** - Links triage to the overall visit workflow
3. **TriageMeasurementService** - Business logic for triage operations
4. **TriageMeasurementController** - REST API endpoints
5. **VisitStage Enum** - Defines TRIAGE as a workflow stage

## Database Schema

### TriageMeasurement Table

```sql
CREATE TABLE triage_measurements (
    id BIGINT PRIMARY KEY,
    patient_visit_session_id BIGINT UNIQUE NOT NULL,
    blood_pressure VARCHAR(20),
    random_blood_sugar DECIMAL(5,2),
    intraocular_pressure DECIMAL(5,2),
    weight DECIMAL(5,2),
    notes TEXT,
    measured_by BIGINT,
    measurement_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);
```

### Key Fields

- **blood_pressure**: Systolic/Diastolic format (e.g., "120/80")
- **random_blood_sugar**: Blood glucose level in mg/dL
- **intraocular_pressure**: Eye pressure measurement in mmHg
- **weight**: Patient weight in kg
- **notes**: Additional assessment notes
- **measured_by**: User ID of the person performing triage
- **measurement_date**: When triage was performed

## API Endpoints

### 1. Create Triage Measurement

**Endpoint**: `POST /api/triage-measurements`

**Request Body**:
```json
{
  "patientVisitSessionId": 1,
  "bloodPressure": "120/80",
  "randomBloodSugar": 95.5,
  "intraocularPressure": 16.0,
  "weight": 70.5,
  "notes": "Patient appears stable, no immediate concerns",
  "measurementDate": "2025-01-15T10:30:00"
}
```

**Response**:
```json
{
  "id": 1,
  "patientVisitSessionId": 1,
  "bloodPressure": "120/80",
  "randomBloodSugar": 95.5,
  "intraocularPressure": 16.0,
  "weight": 70.5,
  "notes": "Patient appears stable, no immediate concerns",
  "measuredBy": 2,
  "measurementDate": "2025-01-15T10:30:00",
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

### 2. Get Triage Measurement by ID

**Endpoint**: `GET /api/triage-measurements/{id}`

**Response**:
```json
{
  "id": 1,
  "patientVisitSessionId": 1,
  "bloodPressure": "120/80",
  "randomBloodSugar": 95.5,
  "intraocularPressure": 16.0,
  "weight": 70.5,
  "notes": "Patient appears stable, no immediate concerns",
  "measuredBy": 2,
  "measurementDate": "2025-01-15T10:30:00",
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

### 3. Update Triage Measurement

**Endpoint**: `PUT /api/triage-measurements/{id}`

**Request Body**: Same as create
**Response**: Updated triage measurement object

### 4. Delete Triage Measurement

**Endpoint**: `DELETE /api/triage-measurements/{id}`

**Response**: `204 No Content`

### 5. Get All Triage Measurements

**Endpoint**: `GET /api/triage-measurements`

**Query Parameters**:
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)
- `sort`: Sort field (default: "id")

**Response**:
```json
{
  "content": [
    {
      "id": 1,
      "patientVisitSessionId": 1,
      "bloodPressure": "120/80",
      "randomBloodSugar": 95.5,
      "intraocularPressure": 16.0,
      "weight": 70.5,
      "notes": "Patient appears stable",
      "measuredBy": 2,
      "measurementDate": "2025-01-15T10:30:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

### 6. Get Triage by Visit Session

**Endpoint**: `GET /api/triage-measurements/visit-session/{visitSessionId}`

**Response**: Triage measurement for the specific visit session

## Workflow Integration

### Visit Stage Progression

1. **RECEPTION** → Patient registered
2. **CASHIER** → Payment processed
3. **TRIAGE** → Vital signs measured ← **TRIAGE STAGE**
4. **DOCTOR_VISIT** → Doctor examination
5. **PHARMACY** → Medication dispensed
6. **COMPLETED** → Visit finished

### Automatic Stage Progression

When triage is completed, the visit session automatically progresses to the next stage:

```java
// In PatientVisitSessionService
public PatientVisitSessionDto progressToNextStage(Long visitSessionId) {
    PatientVisitSession session = patientVisitSessionRepository.findById(visitSessionId)
        .orElseThrow(() -> new RuntimeException("Visit session not found"));
    
    VisitStage currentStage = session.getCurrentStage();
    VisitStage nextStage = getNextStage(currentStage);
    
    session.setCurrentStage(nextStage);
    session.setStatus(getStatusForStage(nextStage));
    
    return toDto(patientVisitSessionRepository.save(session));
}
```

## Emergency Triage

### Emergency Level Classification

The system supports emergency triage with different priority levels:

```java
public enum EmergencyLevel {
    CRITICAL,    // Immediate attention required
    URGENT,      // Attention within 1 hour
    SEMI_URGENT, // Attention within 4 hours
    NON_URGENT   // Routine care
}
```

### Emergency Triage Workflow

1. **Emergency Detection**: Visit purpose marked as EMERGENCY
2. **Priority Assessment**: Emergency level assigned
3. **Immediate Triage**: Critical vital signs measured
4. **Fast-track Processing**: Bypass normal queue if needed

## Business Rules

### 1. One Triage per Visit Session

Each patient visit session can have only one triage measurement:

```java
@OneToOne
@JoinColumn(name = "patient_visit_session_id", unique = true)
private PatientVisitSession patientVisitSession;
```

### 2. Required Fields

- **patientVisitSessionId**: Must be provided
- **measuredBy**: Automatically set to current user
- **measurementDate**: Automatically set to current timestamp

### 3. Validation Rules

- **Blood Pressure**: Format validation (e.g., "120/80")
- **Blood Sugar**: Range validation (0-1000 mg/dL)
- **IOP**: Range validation (0-50 mmHg)
- **Weight**: Range validation (0-500 kg)

### 4. Access Control

- **RECEPTIONIST**: Can create and view triage measurements
- **NURSE**: Can create, update, and view triage measurements
- **DOCTOR**: Can view triage measurements
- **ADMIN/SUPER_ADMIN**: Full access

## Integration with Other Systems

### 1. Patient Visit Sessions

Triage is tightly integrated with the patient visit workflow:

```java
// When triage is completed, update visit session
public PatientVisitSessionDto completeTriage(Long visitSessionId, TriageMeasurementDto triageDto) {
    // Create triage measurement
    TriageMeasurement triage = createTriageMeasurement(triageDto);
    
    // Progress visit session to next stage
    return progressToNextStage(visitSessionId);
}
```

### 2. Emergency System

Emergency visits can bypass normal triage workflow:

```java
if (visitSession.getIsEmergency()) {
    // Fast-track triage for emergency patients
    visitSession.setCurrentStage(VisitStage.TRIAGE);
    visitSession.setEmergencyLevel(EmergencyLevel.CRITICAL);
}
```

### 3. Doctor Recommendations

Triage data influences doctor recommendations:

```java
// Doctor can view triage data when making recommendations
public DoctorRecommendationDto createRecommendation(Long visitSessionId, DoctorRecommendationDto dto) {
    TriageMeasurement triage = triageMeasurementRepository.findByPatientVisitSessionId(visitSessionId);
    
    // Include triage data in recommendation
    dto.setTriageData(triage);
    
    return doctorRecommendationService.createRecommendation(dto);
}
```

## Error Handling

### Common Error Scenarios

1. **Duplicate Triage**: Attempting to create triage for visit session that already has one
2. **Invalid Visit Session**: Triage for non-existent visit session
3. **Invalid Measurements**: Out-of-range vital signs
4. **Access Denied**: Insufficient permissions

### Error Responses

```json
{
  "error": "Validation Error",
  "message": "Blood pressure format is invalid. Expected format: systolic/diastolic",
  "timestamp": "2025-01-15T10:30:00",
  "path": "/api/triage-measurements"
}
```

## Testing

### Test Scenarios

1. **Normal Triage Flow**
   - Create visit session
   - Complete triage
   - Verify stage progression

2. **Emergency Triage**
   - Create emergency visit
   - Complete urgent triage
   - Verify fast-track processing

3. **Data Validation**
   - Test invalid vital signs
   - Test missing required fields
   - Test duplicate triage

### Test Scripts

```bash
# Test triage creation
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

# Test triage retrieval
curl -X GET http://localhost:8080/api/triage-measurements/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Performance Considerations

### 1. Database Indexing

```sql
-- Index for fast lookups by visit session
CREATE INDEX idx_triage_visit_session ON triage_measurements(patient_visit_session_id);

-- Index for date range queries
CREATE INDEX idx_triage_measurement_date ON triage_measurements(measurement_date);
```

### 2. Caching Strategy

- Cache triage measurements for active visit sessions
- Invalidate cache when triage is updated
- Use Redis for distributed caching

### 3. Batch Operations

For high-volume scenarios, support batch triage creation:

```java
public List<TriageMeasurementDto> createBatchTriage(List<TriageMeasurementDto> triageList) {
    return triageList.stream()
        .map(this::createTriageMeasurement)
        .collect(Collectors.toList());
}
```

## Security Considerations

### 1. Data Privacy

- Triage data is sensitive medical information
- Access logs all triage operations
- Data encryption in transit and at rest

### 2. Audit Trail

```java
@EntityListeners(AuditingEntityListener.class)
public class TriageMeasurement {
    @CreatedBy
    private String createdBy;
    
    @LastModifiedBy
    private String updatedBy;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### 3. Role-Based Access

```java
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'NURSE', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')")
public class TriageMeasurementController {
    // Controller methods
}
```

## Future Enhancements

### 1. Advanced Triage Features

- **Automated Risk Assessment**: AI-powered risk scoring
- **Clinical Decision Support**: Evidence-based triage protocols
- **Integration with Medical Devices**: Direct data capture from devices

### 2. Mobile Support

- **Mobile Triage App**: For field triage
- **Offline Support**: Sync when connection restored
- **Voice Notes**: Audio recording of triage notes

### 3. Analytics and Reporting

- **Triage Metrics**: Wait times, throughput
- **Quality Indicators**: Triage accuracy, outcomes
- **Predictive Analytics**: Patient flow forecasting

## Troubleshooting

### Common Issues

1. **Triage Not Saving**
   - Check database constraints
   - Verify user permissions
   - Check for validation errors

2. **Stage Not Progressing**
   - Verify triage completion
   - Check workflow configuration
   - Review error logs

3. **Data Not Displaying**
   - Check API authentication
   - Verify data relationships
   - Review frontend integration

### Debug Commands

```bash
# Check triage data
curl -X GET http://localhost:8080/api/triage-measurements \
  -H "Authorization: Bearer $TOKEN"

# Check visit session status
curl -X GET http://localhost:8080/api/patient-visit-sessions/1 \
  -H "Authorization: Bearer $TOKEN"

# Check database directly
psql -d eyesante_db -c "SELECT * FROM triage_measurements;"
```

## Conclusion

The triage system provides a robust foundation for patient assessment and workflow management. It integrates seamlessly with the patient visit session workflow and supports both routine and emergency care scenarios. The system is designed for scalability, security, and ease of use while maintaining data integrity and audit trails. 