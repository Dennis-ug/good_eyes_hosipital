# Triage System - Frontend Integration Guide

## Overview
The triage system has been implemented in the backend and is ready for frontend integration. This document provides a quick overview of what the frontend team needs to know.

## Files Copied to Frontend
- `TRIAGE_DOCS.md` - Complete triage system documentation
- `TRIAGE_QUICK_REF.md` - Quick reference for API endpoints
- `TRIAGE_SYSTEM_DOCUMENTATION.md` - Detailed system documentation
- `test-triage-system.sh` - Test script for API endpoints

## Key API Endpoints for Frontend

### 1. Create Triage Measurement
```javascript
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

### 2. Get Triage by Visit Session
```javascript
GET /api/triage-measurements/visit-session/{visitSessionId}
```

### 3. Update Triage
```javascript
PUT /api/triage-measurements/{id}
```

### 4. Delete Triage
```javascript
DELETE /api/triage-measurements/{id}
```

## Frontend Integration Points

### 1. Visit Session Workflow
- Triage is stage 3 in the visit workflow
- After triage completion, visit automatically progresses to DOCTOR_VISIT
- One triage per visit session

### 2. Form Validation
- Blood Pressure: "systolic/diastolic" format (e.g., "120/80")
- Blood Sugar: 0-1000 mg/dL range
- IOP: 0-50 mmHg range
- Weight: 0-500 kg range

### 3. Emergency Triage
- Support for emergency priority levels
- Fast-track processing for emergency patients
- Different UI flows for emergency vs routine triage

## UI Components Needed

### 1. Triage Form
- Vital signs input fields
- Validation messages
- Save/Cancel buttons

### 2. Triage Display
- Read-only view of triage data
- Integration with visit session status

### 3. Emergency Triage
- Priority level selection
- Critical vital signs highlighting
- Emergency workflow indicators

## Authentication
All triage endpoints require authentication:
```javascript
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

## Error Handling
Handle these common errors:
- Duplicate triage for visit session
- Invalid vital signs ranges
- Missing required fields
- Insufficient permissions

## Testing
Use the provided test script to verify API functionality:
```bash
chmod +x test-triage-system.sh
./test-triage-system.sh
```

## Next Steps
1. Review the detailed documentation in `TRIAGE_DOCS.md`
2. Implement triage form components
3. Integrate with visit session workflow
4. Add emergency triage support
5. Test with the provided test script

## Questions?
Refer to the detailed documentation files or contact the backend team for API-specific questions. 