# Complete API Implementation Guide

## Overview
This guide provides the complete API structure for the Patient Visit Sessions and Inventory Integration system. All APIs follow RESTful conventions with proper authentication and authorization.

## Base URL
```
http://localhost:5025/api


http://localhost:8080/api
```

## Authentication
All APIs require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Patient Visit Sessions APIs

### Base Path: `/api/patient-visit-sessions`

#### Create Visit Session
```http
POST /api/patient-visit-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": 1,
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Eye pain and blurry vision",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "notes": "Patient reports severe eye pain"
}
```

#### Get Visit Session by ID
```http
GET /api/patient-visit-sessions/{id}
Authorization: Bearer <token>
```

#### Get All Visit Sessions
```http
GET /api/patient-visit-sessions?page=0&size=20
Authorization: Bearer <token>
```

#### Get Visit Sessions by Patient ID
```http
GET /api/patient-visit-sessions/patient/{patientId}
Authorization: Bearer <token>
```

#### Get Visit Sessions by Status
```http
GET /api/patient-visit-sessions/status/{status}
Authorization: Bearer <token>
```

#### Get Visit Sessions by Purpose
```http
GET /api/patient-visit-sessions/purpose/{purpose}
Authorization: Bearer <token>
```

#### Update Visit Session
```http
PUT /api/patient-visit-sessions/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitPurpose": "FOLLOW_UP",
  "chiefComplaint": "Follow-up for previous treatment",
  "notes": "Patient returning for follow-up"
}
```

#### Update Visit Session Status
```http
PUT /api/patient-visit-sessions/{id}/status?status=PAYMENT_COMPLETED
Authorization: Bearer <token>
```

#### Complete Visit Session
```http
PUT /api/patient-visit-sessions/{id}/complete
Authorization: Bearer <token>
```

#### Cancel Visit Session
```http
PUT /api/patient-visit-sessions/{id}/cancel?reason=Patient requested cancellation
Authorization: Bearer <token>
```

#### Mark Visit as No-Show
```http
PUT /api/patient-visit-sessions/{id}/no-show
Authorization: Bearer <token>
```

#### Delete Visit Session
```http
DELETE /api/patient-visit-sessions/{id}
Authorization: Bearer <token>
```

#### Get Visit Session Statistics
```http
GET /api/patient-visit-sessions/statistics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Search Visit Sessions
```http
GET /api/patient-visit-sessions/search?patientName=John&status=COMPLETED&purpose=NEW_CONSULTATION&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

---

## 2. Triage Measurements APIs

### Base Path: `/api/triage-measurements`

#### Create Triage Measurement
```http
POST /api/triage-measurements
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitSessionId": 1,
  "systolicBp": 120,
  "diastolicBp": 80,
  "rbsValue": 95.5,
  "rbsUnit": "mg/dL",
  "iopRight": 16,
  "iopLeft": 15,
  "weightKg": 70.5,
  "weightLbs": 155.0,
  "notes": "All measurements within normal range",
  "measuredBy": "Nurse Smith"
}
```

#### Get Triage Measurement by ID
```http
GET /api/triage-measurements/{id}
Authorization: Bearer <token>
```

#### Get Triage Measurement by Visit Session
```http
GET /api/triage-measurements/visit-session/{visitSessionId}
Authorization: Bearer <token>
```

#### Get All Triage Measurements
```http
GET /api/triage-measurements
Authorization: Bearer <token>
```

#### Update Triage Measurement
```http
PUT /api/triage-measurements/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "systolicBp": 125,
  "diastolicBp": 85,
  "iopRight": 17,
  "iopLeft": 16,
  "notes": "Updated measurements"
}
```

#### Delete Triage Measurement
```http
DELETE /api/triage-measurements/{id}
Authorization: Bearer <token>
```

---

## 3. Basic Refraction Exam APIs

### Base Path: `/api/basic-refraction-exams`

#### Create Basic Refraction Exam
```http
POST /api/basic-refraction-exams
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitSessionId": 1,
  "neuroOriented": true,
  "neuroMood": "Alert and cooperative",
  "pupilsPerrl": true,
  "pupilsRightDark": "3mm",
  "pupilsRightLight": "2mm",
  "visualAcuityDistanceScRight": "20/20",
  "visualAcuityDistanceScLeft": "20/25",
  "manifestAutoRightSphere": -1.25,
  "manifestAutoRightCylinder": -0.50,
  "manifestAutoRightAxis": 90,
  "manifestAutoLeftSphere": -1.00,
  "manifestAutoLeftCylinder": -0.25,
  "manifestAutoLeftAxis": 85,
  "examinationDate": "2024-01-15T10:30:00",
  "examinedBy": "Dr. Johnson"
}
```

#### Get Basic Refraction Exam by ID
```http
GET /api/basic-refraction-exams/{id}
Authorization: Bearer <token>
```

#### Get Basic Refraction Exam by Visit Session
```http
GET /api/basic-refraction-exams/visit-session/{visitSessionId}
Authorization: Bearer <token>
```

#### Update Basic Refraction Exam
```http
PUT /api/basic-refraction-exams/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "visualAcuityDistanceScRight": "20/15",
  "manifestAutoRightSphere": -1.00,
  "notes": "Updated refraction values"
}
```

#### Delete Basic Refraction Exam
```http
DELETE /api/basic-refraction-exams/{id}
Authorization: Bearer <token>
```

---

## 4. Main Examination APIs

### Base Path: `/api/main-examinations`

#### Create Main Examination
```http
POST /api/main-examinations
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitSessionId": 1,
  "externalRight": "Normal external appearance, no swelling or redness",
  "externalLeft": "Normal external appearance, no swelling or redness",
  "cdrRight": 0.3,
  "cdrLeft": 0.3,
  "iopRight": 16,
  "iopLeft": 15,
  "advice": "Continue current treatment regimen",
  "historyComments": "Patient reports gradual vision changes over past 6 months",
  "doctorsNotes": "Comprehensive examination completed. Patient shows early signs of myopia.",
  "outcome": "HOME_WITH_FOLLOWUP",
  "followupWhen": "2024-02-15T10:00:00",
  "followupInTime": "2 weeks",
  "timeCompleted": "2024-01-15T11:30:00"
}
```

#### Get Main Examination by ID
```http
GET /api/main-examinations/{id}
Authorization: Bearer <token>
```

#### Get Main Examination by Visit Session
```http
GET /api/main-examinations/visit-session/{visitSessionId}
Authorization: Bearer <token>
```

#### Update Main Examination
```http
PUT /api/main-examinations/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "advice": "Follow-up in 2 weeks with updated prescription",
  "outcome": "HOME_WITH_FOLLOWUP",
  "followupWhen": "2024-02-20T10:00:00",
  "doctorsNotes": "Updated examination notes with new findings"
}
```

#### Delete Main Examination
```http
DELETE /api/main-examinations/{id}
Authorization: Bearer <token>
```

#### Add Diagnosis to Main Examination
```http
POST /api/main-examinations/{id}/diagnoses
Authorization: Bearer <token>
Content-Type: application/json

{
  "diagnosisId": 5,
  "eyeSide": "BOTH"
}
```

#### Add Treatment to Main Examination
```http
POST /api/main-examinations/{id}/treatments
Authorization: Bearer <token>
Content-Type: application/json

{
  "inventoryItemId": 5,
  "eyeSide": "BOTH",
  "frequency": "3 times daily",
  "duration": "2 weeks",
  "quantity": 30,
  "instruction": "Apply 1 drop in each eye"
}
```

#### Add Procedure to Main Examination
```http
POST /api/main-examinations/{id}/procedures
Authorization: Bearer <token>
Content-Type: application/json

{
  "procedureId": 3,
  "eyeSide": "RIGHT",
  "notes": "Laser treatment for retinal tear"
}
```

#### Add Investigation to Main Examination
```http
POST /api/main-examinations/{id}/investigations
Authorization: Bearer <token>
Content-Type: application/json

{
  "investigationTypeId": 2,
  "eyeSide": "BOTH",
  "notes": "OCT scan for macular evaluation"
}
```

#### Add Eye Glasses to Main Examination
```http
POST /api/main-examinations/{id}/eye-glasses
Authorization: Bearer <token>
Content-Type: application/json

{
  "eyeGlassId": 4,
  "eyeSide": "BOTH",
  "quantity": 1,
  "notes": "Progressive lenses with anti-reflective coating"
}
```

#### Add Sundry to Main Examination
```http
POST /api/main-examinations/{id}/sundries
Authorization: Bearer <token>
Content-Type: application/json

{
  "sundryId": 6,
  "quantity": 2,
  "notes": "Eye patches for post-surgery"
}
```

#### Add Disability to Main Examination
```http
POST /api/main-examinations/{id}/disabilities
Authorization: Bearer <token>
Content-Type: application/json

{
  "disabilityId": 1,
  "notes": "Visual impairment affecting daily activities"
}
```

#### Create Admission Details
```http
POST /api/main-examinations/{id}/admission-details
Authorization: Bearer <token>
Content-Type: application/json

{
  "wardId": 2,
  "admissionDate": "2024-01-15T12:00:00",
  "estimatedStay": "3 days",
  "reason": "Emergency surgery required",
  "notes": "Patient admitted for immediate surgical intervention"
}
```

#### Create Referral Details
```http
POST /api/main-examinations/{id}/referral-details
Authorization: Bearer <token>
Content-Type: application/json

{
  "referralHospitalId": 3,
  "referralDate": "2024-01-15T13:00:00",
  "reason": "Specialized retinal surgery",
  "urgency": "URGENT",
  "notes": "Patient referred for advanced retinal procedures"
}
```

#### Create Follow-up Details
```http
POST /api/main-examinations/{id}/followup-details
Authorization: Bearer <token>
Content-Type: application/json

{
  "followupDate": "2024-02-15T10:00:00",
  "followupType": "REVIEW",
  "instructions": "Return for medication review and vision assessment",
  "reminderSent": false
}
```

---

## 5. Doctor Recommendations APIs

### Base Path: `/api/doctor-recommendations`

#### Create Doctor Recommendation
```http
POST /api/doctor-recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitSessionId": 1,
  "recommendationType": "MEDICATION_ONLY",
  "diagnosis": "Myopia with astigmatism",
  "treatmentPlan": "Prescription glasses and eye drops",
  "medications": "Artificial tears 3 times daily",
  "followUpRequired": true,
  "followUpDate": "2024-02-15T10:00:00",
  "recommendedBy": "Dr. Johnson",
  "recommendationDate": "2024-01-15T12:00:00"
}
```

#### Get Doctor Recommendation by ID
```http
GET /api/doctor-recommendations/{id}
Authorization: Bearer <token>
```

#### Get Doctor Recommendation by Visit Session
```http
GET /api/doctor-recommendations/visit-session/{visitSessionId}
Authorization: Bearer <token>
```

#### Update Doctor Recommendation
```http
PUT /api/doctor-recommendations/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "treatmentPlan": "Updated treatment plan",
  "followUpDate": "2024-02-20T10:00:00"
}
```

#### Delete Doctor Recommendation
```http
DELETE /api/doctor-recommendations/{id}
Authorization: Bearer <token>
```

---

## 6. Medication Refill APIs

### Base Path: `/api/medication-refills`

#### Create Medication Refill
```http
POST /api/medication-refills
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitSessionId": 1,
  "inventoryItemId": 5,
  "quantityRequested": 30,
  "refillReason": "Running out of medication",
  "patientCompliant": true,
  "sideEffectsReported": "None",
  "effectivenessRating": 5,
  "approvedBy": "Dr. Johnson",
  "dispensedBy": "Pharmacist Smith"
}
```

#### Get Medication Refill by ID
```http
GET /api/medication-refills/{id}
Authorization: Bearer <token>
```

#### Get Medication Refill by Visit Session
```http
GET /api/medication-refills/visit-session/{visitSessionId}
Authorization: Bearer <token>
```

#### Approve Medication Refill
```http
PUT /api/medication-refills/{id}/approve
Authorization: Bearer <token>
```

#### Dispense Medication Refill
```http
PUT /api/medication-refills/{id}/dispense
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantityDispensed": 30,
  "dispensedBy": "Pharmacist Smith"
}
```

#### Update Medication Refill
```http
PUT /api/medication-refills/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantityRequested": 60,
  "refillReason": "Extended treatment period"
}
```

#### Delete Medication Refill
```http
DELETE /api/medication-refills/{id}
Authorization: Bearer <token>
```

---

## 7. Review APIs

### Base Path: `/api/reviews`

#### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitSessionId": 1,
  "previousVisitId": 5,
  "reviewType": "TREATMENT_REVIEW",
  "treatmentCompliance": true,
  "symptomImprovement": true,
  "sideEffectsExperienced": "None",
  "currentSymptoms": "Improved vision",
  "treatmentEffectivenessRating": 5,
  "recommendationChanges": false,
  "reviewedBy": "Dr. Johnson",
  "reviewDate": "2024-01-15T14:00:00"
}
```

#### Get Review by ID
```http
GET /api/reviews/{id}
Authorization: Bearer <token>
```

#### Get Review by Visit Session
```http
GET /api/reviews/visit-session/{visitSessionId}
Authorization: Bearer <token>
```

#### Update Review
```http
PUT /api/reviews/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "treatmentEffectivenessRating": 4,
  "newRecommendations": "Continue current treatment"
}
```

#### Delete Review
```http
DELETE /api/reviews/{id}
Authorization: Bearer <token>
```

---

## 8. Emergency APIs

### Base Path: `/api/emergencies`

#### Create Emergency
```http
POST /api/emergencies
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitSessionId": 1,
  "emergencyType": "EYE_TRAUMA",
  "priorityLevel": "HIGH",
  "chiefComplaint": "Severe eye pain after injury",
  "onsetTime": "2024-01-15T09:00:00",
  "severityLevel": "SEVERE",
  "vitalSignsStable": true,
  "painLevel": 8,
  "immediateActionTaken": "Eye irrigation and pain management",
  "attendedBy": "Dr. Emergency",
  "arrivalTime": "2024-01-15T09:30:00"
}
```

#### Get Emergency by ID
```http
GET /api/emergencies/{id}
Authorization: Bearer <token>
```

#### Get Emergency by Visit Session
```http
GET /api/emergencies/visit-session/{visitSessionId}
Authorization: Bearer <token>
```

#### Update Emergency
```http
PUT /api/emergencies/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "severityLevel": "MODERATE",
  "immediateActionTaken": "Treatment completed, patient stable"
}
```

#### Stabilize Emergency
```http
PUT /api/emergencies/{id}/stabilize
Authorization: Bearer <token>
```

#### Transfer Emergency
```http
PUT /api/emergencies/{id}/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "transferHospital": "Regional Hospital",
  "transferReason": "Requires specialized surgery"
}
```

#### Delete Emergency
```http
DELETE /api/emergencies/{id}
Authorization: Bearer <token>
```

---

## 9. Inventory Drug APIs

### Base Path: `/api/inventory/drugs`

#### Search Drugs by Name
```http
GET /api/inventory/drugs/search?name=tropicamide
Authorization: Bearer <token>
```

#### Get Available Drugs
```http
GET /api/inventory/drugs/available
Authorization: Bearer <token>
```

#### Get Drugs by Category
```http
GET /api/inventory/drugs/category/DRUGS
Authorization: Bearer <token>
```

#### Get Low Stock Drugs
```http
GET /api/inventory/drugs/low-stock
Authorization: Bearer <token>
```

#### Get Expiring Drugs
```http
GET /api/inventory/drugs/expiring
Authorization: Bearer <token>
```

#### Get Prescription Drugs
```http
GET /api/inventory/drugs/prescription
Authorization: Bearer <token>
```

#### Get Controlled Substances
```http
GET /api/inventory/drugs/controlled
Authorization: Bearer <token>
```

#### Get Drug by SKU
```http
GET /api/inventory/drugs/sku/{sku}
Authorization: Bearer <token>
```

#### Get Drug by ID
```http
GET /api/inventory/drugs/{id}
Authorization: Bearer <token>
```

#### Check Drug Availability
```http
GET /api/inventory/drugs/{id}/availability?quantity=10
Authorization: Bearer <token>
```

#### Get Drug Stock Level
```http
GET /api/inventory/drugs/{id}/stock
Authorization: Bearer <token>
```

#### Advanced Drug Search
```http
GET /api/inventory/drugs/advanced-search?name=eye&inStock=true&maxPrice=25.00
Authorization: Bearer <token>
```

---

## 10. Main Examination Treatment APIs

### Base Path: `/api/main-examination-treatments`

#### Create Treatment
```http
POST /api/main-examination-treatments
Authorization: Bearer <token>
Content-Type: application/json

{
  "mainExaminationId": 1,
  "inventoryItemId": 5,
  "eyeSide": "BOTH",
  "frequency": "3 times daily",
  "duration": "2 weeks",
  "quantity": 30,
  "instruction": "Apply 1 drop in each eye"
}
```

#### Get Treatment by ID
```http
GET /api/main-examination-treatments/{id}
Authorization: Bearer <token>
```

#### Get Treatments by Main Examination
```http
GET /api/main-examination-treatments/main-examination/{mainExaminationId}
Authorization: Bearer <token>
```

#### Update Treatment
```http
PUT /api/main-examination-treatments/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "frequency": "2 times daily",
  "duration": "1 week",
  "instruction": "Updated instructions"
}
```

#### Dispense Treatment
```http
PUT /api/main-examination-treatments/{id}/dispense
Authorization: Bearer <token>
```

#### Delete Treatment
```http
DELETE /api/main-examination-treatments/{id}
Authorization: Bearer <token>
```

---

## 11. Main Examination Diagnosis APIs

### Base Path: `/api/main-examination-diagnoses`

#### Create Diagnosis
```http
POST /api/main-examination-diagnoses
Authorization: Bearer <token>
Content-Type: application/json

{
  "mainExaminationId": 1,
  "diagnosisId": 5,
  "eyeSide": "BOTH"
}
```

#### Get Diagnosis by ID
```http
GET /api/main-examination-diagnoses/{id}
Authorization: Bearer <token>
```

#### Get Diagnoses by Main Examination
```http
GET /api/main-examination-diagnoses/main-examination/{mainExaminationId}
Authorization: Bearer <token>
```

#### Update Diagnosis
```http
PUT /api/main-examination-diagnoses/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "eyeSide": "RIGHT"
}
```

#### Delete Diagnosis
```http
DELETE /api/main-examination-diagnoses/{id}
Authorization: Bearer <token>
```

---

## 12. Slit Lamp Examination APIs

### Base Path: `/api/slit-lamp-examinations`

#### Create Slit Lamp Examination
```http
POST /api/slit-lamp-examinations
Authorization: Bearer <token>
Content-Type: application/json

{
  "mainExaminationId": 1,
  "eyeSide": "RIGHT",
  "structureType": "CORNEA",
  "findingName": "Clear",
  "findingValue": true,
  "otherNotes": "Normal corneal appearance"
}
```

#### Get Slit Lamp Examination by ID
```http
GET /api/slit-lamp-examinations/{id}
Authorization: Bearer <token>
```

#### Get Slit Lamp Examinations by Main Examination
```http
GET /api/slit-lamp-examinations/main-examination/{mainExaminationId}
Authorization: Bearer <token>
```

#### Update Slit Lamp Examination
```http
PUT /api/slit-lamp-examinations/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "findingValue": false,
  "otherNotes": "Corneal abrasion detected"
}
```

#### Delete Slit Lamp Examination
```http
DELETE /api/slit-lamp-examinations/{id}
Authorization: Bearer <token>
```

---

## Response Formats

### Success Response
```json
{
  "id": 1,
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Entity data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/endpoint"
}
```

### Pagination Response
```json
{
  "content": [
    // Array of entities
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

---

## Authentication & Authorization

### Required Roles for Each API Group

#### Patient Visit Sessions
- **RECEPTIONIST**: Create, update, cancel, mark no-show
- **DOCTOR/OPHTHALMOLOGIST/OPTOMETRIST**: View, update status, complete
- **ADMIN/SUPER_ADMIN**: All operations

#### Examinations
- **DOCTOR/OPHTHALMOLOGIST/OPTOMETRIST**: All operations
- **ADMIN/SUPER_ADMIN**: All operations

#### Inventory
- **DOCTOR/OPHTHALMOLOGIST/OPTOMETRIST**: Search, view, check availability
- **ADMIN/SUPER_ADMIN**: All operations

#### Emergency
- **DOCTOR/OPHTHALMOLOGIST/OPTOMETRIST**: All operations
- **ADMIN/SUPER_ADMIN**: All operations

---

## Implementation Notes

1. **Validation**: All input data should be validated
2. **Error Handling**: Proper error responses with meaningful messages
3. **Logging**: Comprehensive logging for all operations
4. **Security**: JWT authentication and role-based authorization
5. **Performance**: Use pagination for large datasets
6. **Documentation**: Swagger/OpenAPI documentation recommended

This comprehensive API structure provides all necessary endpoints for the complete patient visit sessions and inventory management system. 