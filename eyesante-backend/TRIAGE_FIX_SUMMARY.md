## Triage System Fix Summary

## Problem
The triage system was throwing a NullPointerException:
```
Cannot invoke "com.rossumtechsystems.eyesante_backend.entity.PatientVisitSession.getId()" 
because the return value of "com.rossumtechsystems.eyesante_backend.entity.TriageMeasurement.getVisitSession()" is null
```

## Root Cause
The controller was accepting `TriageMeasurement` entity directly in request body, but the frontend was sending a DTO with `visitSessionId`. The entity didn't have the `visitSession` relationship set, causing the null pointer exception.

## Solution
1. **Changed Controller to Accept DTO**: Modified `TriageMeasurementController` to accept `TriageMeasurementDto` instead of `TriageMeasurement` entity
2. **Added DTO to Entity Conversion**: Created `convertDtoToEntity()` method to properly map DTO fields to entity with relationship
3. **Added Repository Dependency**: Injected `PatientVisitSessionRepository` to fetch visit session by ID
4. **Fixed Both Create and Update Methods**: Applied the same fix to both POST and PUT endpoints

## Changes Made

### TriageMeasurementController.java
- Added `PatientVisitSessionRepository` dependency
- Changed `@RequestBody TriageMeasurement` to `@RequestBody TriageMeasurementDto`
- Added `convertDtoToEntity()` method
- Fixed both create and update endpoints

### Key Method Added
```java
private TriageMeasurement convertDtoToEntity(TriageMeasurementDto dto) {
    TriageMeasurement entity = new TriageMeasurement();
    
    // Set visit session relationship
    if (dto.getVisitSessionId() != null) {
        var visitSession = patientVisitSessionRepository.findById(dto.getVisitSessionId())
            .orElseThrow(() -> new RuntimeException("Visit session not found with ID: " + dto.getVisitSessionId()));
        entity.setVisitSession(visitSession);
    }
    
    // Set other fields...
    return entity;
}
```

## API Usage
Now the frontend should send:
```json
{
  "visitSessionId": 1,
  "systolicBp": 120,
  "diastolicBp": 80,
  "rbsValue": 95.5,
  "rbsUnit": "mg/dL",
  "iopRight": 16,
  "iopLeft": 16,
  "weightKg": 70.5,
  "notes": "Patient stable"
}
```

Instead of trying to send the full entity structure.

## Testing
The fix ensures that:
1. DTO is properly converted to entity
2. Visit session relationship is correctly established
3. No null pointer exceptions occur
4. All triage operations work correctly

## Status
✅ Fixed and ready for testing
