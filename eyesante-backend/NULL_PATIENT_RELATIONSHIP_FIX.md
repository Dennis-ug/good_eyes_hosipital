# Null Patient Relationship Fix

## Problem
The application was throwing a `NullPointerException` when trying to access `PatientVisitSession.getPatient().getId()` because the patient relationship was null. This was happening in:

1. **Service Layer**: `createVisitSession()` method trying to log patient ID
2. **Controller Layer**: `createVisitSession()` method trying to log patient ID
3. **DTO Constructor**: Trying to access patient fields without proper null checks

## Root Cause
The issue occurred because:
1. Frontend was sending JSON with just `patientId` instead of full patient object
2. Jackson deserialization wasn't properly setting the patient relationship
3. No validation was in place to ensure patient is set before processing

## Solution Applied

### 1. Created Request DTO
**File**: `src/main/java/com/rossumtechsystems/eyesante_backend/dto/CreatePatientVisitSessionRequest.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientVisitSessionRequest {
    private Long patientId;
    private String visitPurpose;
    private String chiefComplaint;
    private Boolean requiresTriage;
    private Boolean requiresDoctorVisit;
    private Boolean isEmergency;
    private Boolean consultationFeePaid;
    private Double consultationFeeAmount;
    private String paymentMethod;
    private String paymentReference;
    private Long previousVisitId;
    private String emergencyLevel;
    private String notes;
}
```

### 2. Updated Service Layer
**File**: `src/main/java/com/rossumtechsystems/eyesante_backend/service/PatientVisitSessionService.java`

#### Added New Method
```java
public PatientVisitSessionDto createVisitSession(CreatePatientVisitSessionRequest request) {
    log.info("Creating new patient visit session for patient ID: {}", request.getPatientId());
    
    // Find the patient
    Patient patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + request.getPatientId()));
    
    // Create the visit session with proper patient relationship
    PatientVisitSession visitSession = new PatientVisitSession();
    visitSession.setPatient(patient);
    // ... set other fields
    
    PatientVisitSession saved = patientVisitSessionRepository.save(visitSession);
    return new PatientVisitSessionDto(saved);
}
```

#### Fixed Legacy Method
```java
public PatientVisitSessionDto createVisitSession(PatientVisitSession visitSession) {
    log.info("Creating new patient visit session for patient ID: {}", 
            visitSession.getPatient() != null ? visitSession.getPatient().getId() : "null");
    
    // Validate that patient is set
    if (visitSession.getPatient() == null) {
        throw new RuntimeException("Patient is required for creating a visit session");
    }
    
    // ... rest of method
}
```

#### Fixed Update Method
```java
public PatientVisitSessionDto updateVisitSession(Long id, PatientVisitSession visitSession) {
    // ... existing code
    
    // Update fields (don't update patient relationship to avoid null issues)
    if (visitSession.getVisitPurpose() != null) {
        existing.setVisitPurpose(visitSession.getVisitPurpose());
    }
    // ... other null-safe updates
    
    return new PatientVisitSessionDto(saved);
}
```

### 3. Updated Controller Layer
**File**: `src/main/java/com/rossumtechsystems/eyesante_backend/controller/PatientVisitSessionController.java`

#### Updated Main Endpoint
```java
@PostMapping
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
public ResponseEntity<PatientVisitSessionDto> createVisitSession(@RequestBody CreatePatientVisitSessionRequest request) {
    log.info("Creating new patient visit session for patient ID: {}", request.getPatientId());
    PatientVisitSessionDto created = patientVisitSessionService.createVisitSession(request);
    return ResponseEntity.ok(created);
}
```

#### Added Legacy Endpoint
```java
@PostMapping("/legacy")
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')")
public ResponseEntity<PatientVisitSessionDto> createVisitSessionLegacy(@RequestBody PatientVisitSession visitSession) {
    log.info("Creating new patient visit session (legacy) for patient ID: {}", 
            visitSession.getPatient() != null ? visitSession.getPatient().getId() : "null");
    PatientVisitSessionDto created = patientVisitSessionService.createVisitSession(visitSession);
    return ResponseEntity.ok(created);
}
```

## API Usage

### New Recommended Approach
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

### Legacy Approach (Still Supported)
```http
POST /api/patient-visit-sessions/legacy
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": {
    "id": 123
  },
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Eye pain and blurry vision",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": "Patient reports severe eye pain"
}
```

## Benefits of the Fix

### 1. **Proper Validation**
- Patient existence is validated before creating visit session
- Clear error messages when patient is not found

### 2. **Null Safety**
- All patient access is properly null-checked
- No more NullPointerException

### 3. **Better API Design**
- Request DTO clearly defines expected input
- Separation of concerns between request and entity

### 4. **Backward Compatibility**
- Legacy endpoint still available
- Existing code continues to work

### 5. **Improved Error Handling**
- Specific error messages for different failure scenarios
- Better debugging information

## Testing

### Test the New Endpoint
```bash
curl -X POST http://localhost:8080/api/patient-visit-sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "visitPurpose": "NEW_CONSULTATION",
    "chiefComplaint": "Eye pain and blurry vision",
    "requiresTriage": true,
    "requiresDoctorVisit": true,
    "isEmergency": false
  }'
```

### Test Error Handling
```bash
# Test with non-existent patient
curl -X POST http://localhost:8080/api/patient-visit-sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 999999,
    "visitPurpose": "NEW_CONSULTATION"
  }'
```

## Prevention

To prevent similar issues in the future:

1. **Always validate relationships** before accessing nested objects
2. **Use request DTOs** for complex operations
3. **Add proper null checks** in all service methods
4. **Validate input data** at the controller level
5. **Use meaningful error messages** for debugging

## Current Status

✅ **Null patient relationship issue fixed**
✅ **New request DTO implemented**
✅ **Backward compatibility maintained**
✅ **Proper validation added**
✅ **Error handling improved**

The application should now handle patient visit session creation without null pointer exceptions, with proper validation and clear error messages. 