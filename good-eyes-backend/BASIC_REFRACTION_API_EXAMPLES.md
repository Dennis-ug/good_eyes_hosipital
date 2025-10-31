# Enhanced Basic Refraction Exam API - Request/Response Examples

## Enhanced Basic Refraction Exam API

### Base URL
```
http://localhost:8080/api/basic-refraction-exams
```

### Authentication
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Create Basic Refraction Exam

### Request
**POST** `/api/basic-refraction-exams`

```json
{
  "visitSessionId": 1,
  
  // Neuro/Psych Section
  "neuroOriented": true,
  "neuroMood": "Alert and cooperative",
  "neuroPsychNotes": "Patient shows good cognitive function",
  
  // Pupils Section
  "pupilsPerrl": true,
  "pupilsRightDark": "4.5mm",
  "pupilsRightLight": "2.0mm",
  "pupilsRightShape": "Round",
  "pupilsRightReact": "Brisk",
  "pupilsRightApd": "None",
  "pupilsLeftDark": "4.5mm",
  "pupilsLeftLight": "2.0mm",
  "pupilsLeftShape": "Round",
  "pupilsLeftReact": "Brisk",
  "pupilsLeftApd": "None",
  "pupilsNotes": "Pupils are equal, round, and reactive to light",
  
  // Enhanced Pupil Measurements
  "pupilSizeRight": 4.5,
  "pupilSizeLeft": 4.5,
  "pupilSizeUnit": "mm",
  
  // Visual Acuity Section
  "visualAcuityDistanceScRight": "20/30",
  "visualAcuityDistanceScLeft": "20/40",
  "visualAcuityDistancePhRight": "20/25",
  "visualAcuityDistancePhLeft": "20/30",
  "visualAcuityDistanceCcRight": "20/20",
  "visualAcuityDistanceCcLeft": "20/20",
  "visualAcuityNearScRight": "J4",
  "visualAcuityNearScLeft": "J5",
  "visualAcuityNearCcRight": "J1",
  "visualAcuityNearCcLeft": "J1",
  "visualAcuityNotes": "Distance vision improves with pinhole",
  
  // Refraction Section - Autorefractor
  "manifestAutoRightSphere": -2.00,
  "manifestAutoRightCylinder": -0.75,
  "manifestAutoRightAxis": 90,
  "manifestAutoLeftSphere": -1.75,
  "manifestAutoLeftCylinder": -0.50,
  "manifestAutoLeftAxis": 85,
  
  // Keratometry
  "keratometryK1Right": 43.50,
  "keratometryK2Right": 44.25,
  "keratometryAxisRight": 90,
  "keratometryK1Left": 43.75,
  "keratometryK2Left": 44.00,
  "keratometryAxisLeft": 85,
  
  // Retinoscope
  "manifestRetRightSphere": -1.75,
  "manifestRetRightCylinder": -0.50,
  "manifestRetRightAxis": 90,
  "manifestRetLeftSphere": -1.50,
  "manifestRetLeftCylinder": -0.25,
  "manifestRetLeftAxis": 85,
  
  // Subjective
  "subjectiveRightSphere": -1.75,
  "subjectiveRightCylinder": -0.50,
  "subjectiveRightAxis": 90,
  "subjectiveLeftSphere": -1.50,
  "subjectiveLeftCylinder": -0.25,
  "subjectiveLeftAxis": 85,
  
  // Additional Refraction Data
  "addedValues": "+1.50",
  "bestRightVision": "20/20",
  "bestLeftVision": "20/20",
  "pdRightEye": 32.0,
  "pdLeftEye": 32.0,
  "refractionNotes": "Patient shows moderate myopia with astigmatism",
  
  // Enhanced Measurements
  "iopRight": 18,
  "iopLeft": 17,
  "iopMethod": "GOLDMANN_TONOMETRY",
  "colorVisionRight": "Normal",
  "colorVisionLeft": "Normal",
  "colorVisionTest": "ISHIHARA",
  "stereopsis": 40,
  "stereopsisUnit": "arcseconds",
  "nearAdditionRight": 1.50,
  "nearAdditionLeft": 1.50,
  
  // Clinical Assessment
  "clinicalAssessment": "Patient presents with moderate myopia and early presbyopia",
  "diagnosis": "Myopia with astigmatism and presbyopia",
  "treatmentPlan": "Prescribe progressive lenses with anti-reflective coating",
  
  // Equipment Tracking
  "equipmentUsed": "Autorefractor, Keratometer, Tonometer, Color Vision Test",
  "equipmentCalibrationDate": "2025-01-01",
  
  // General Comments
  "comment": "Comprehensive eye examination completed. Patient shows good ocular health with moderate refractive error.",
  "examinedBy": "Dr. Smith"
}
```

### Response
**Status**: `200 OK`

```json
{
  "id": 1,
  "visitSessionId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  
  // Neuro/Psych Section
  "neuroOriented": true,
  "neuroMood": "Alert and cooperative",
  "neuroPsychNotes": "Patient shows good cognitive function",
  
  // Pupils Section
  "pupilsPerrl": true,
  "pupilsRightDark": "4.5mm",
  "pupilsRightLight": "2.0mm",
  "pupilsRightShape": "Round",
  "pupilsRightReact": "Brisk",
  "pupilsRightApd": "None",
  "pupilsLeftDark": "4.5mm",
  "pupilsLeftLight": "2.0mm",
  "pupilsLeftShape": "Round",
  "pupilsLeftReact": "Brisk",
  "pupilsLeftApd": "None",
  "pupilsNotes": "Pupils are equal, round, and reactive to light",
  
  // Enhanced Pupil Measurements
  "pupilSizeRight": 4.5,
  "pupilSizeLeft": 4.5,
  "pupilSizeUnit": "mm",
  
  // Visual Acuity Section
  "visualAcuityDistanceScRight": "20/30",
  "visualAcuityDistanceScLeft": "20/40",
  "visualAcuityDistancePhRight": "20/25",
  "visualAcuityDistancePhLeft": "20/30",
  "visualAcuityDistanceCcRight": "20/20",
  "visualAcuityDistanceCcLeft": "20/20",
  "visualAcuityNearScRight": "J4",
  "visualAcuityNearScLeft": "J5",
  "visualAcuityNearCcRight": "J1",
  "visualAcuityNearCcLeft": "J1",
  "visualAcuityNotes": "Distance vision improves with pinhole",
  
  // Refraction Section - Autorefractor
  "manifestAutoRightSphere": -2.00,
  "manifestAutoRightCylinder": -0.75,
  "manifestAutoRightAxis": 90,
  "manifestAutoLeftSphere": -1.75,
  "manifestAutoLeftCylinder": -0.50,
  "manifestAutoLeftAxis": 85,
  
  // Keratometry
  "keratometryK1Right": 43.50,
  "keratometryK2Right": 44.25,
  "keratometryAxisRight": 90,
  "keratometryK1Left": 43.75,
  "keratometryK2Left": 44.00,
  "keratometryAxisLeft": 85,
  
  // Retinoscope
  "manifestRetRightSphere": -1.75,
  "manifestRetRightCylinder": -0.50,
  "manifestRetRightAxis": 90,
  "manifestRetLeftSphere": -1.50,
  "manifestRetLeftCylinder": -0.25,
  "manifestRetLeftAxis": 85,
  
  // Subjective
  "subjectiveRightSphere": -1.75,
  "subjectiveRightCylinder": -0.50,
  "subjectiveRightAxis": 90,
  "subjectiveLeftSphere": -1.50,
  "subjectiveLeftCylinder": -0.25,
  "subjectiveLeftAxis": 85,
  
  // Additional Refraction Data
  "addedValues": "+1.50",
  "bestRightVision": "20/20",
  "bestLeftVision": "20/20",
  "pdRightEye": 32.0,
  "pdLeftEye": 32.0,
  "refractionNotes": "Patient shows moderate myopia with astigmatism",
  
  // Enhanced Measurements
  "iopRight": 18,
  "iopLeft": 17,
  "iopMethod": "GOLDMANN_TONOMETRY",
  "colorVisionRight": "Normal",
  "colorVisionLeft": "Normal",
  "colorVisionTest": "ISHIHARA",
  "stereopsis": 40,
  "stereopsisUnit": "arcseconds",
  "nearAdditionRight": 1.50,
  "nearAdditionLeft": 1.50,
  
  // Clinical Assessment
  "clinicalAssessment": "Patient presents with moderate myopia and early presbyopia",
  "diagnosis": "Myopia with astigmatism and presbyopia",
  "treatmentPlan": "Prescribe progressive lenses with anti-reflective coating",
  
  // Equipment Tracking
  "equipmentUsed": "Autorefractor, Keratometer, Tonometer, Color Vision Test",
  "equipmentCalibrationDate": "2025-01-01",
  
  // General Comments
  "comment": "Comprehensive eye examination completed. Patient shows good ocular health with moderate refractive error.",
  "examinedBy": "Dr. Smith",
  "examinationDate": "2025-08-12T10:30:00",
  "createdAt": "2025-08-12T10:30:00",
  "updatedAt": "2025-08-12T10:30:00",
  "createdBy": "Dr. Smith",
  "updatedBy": "Dr. Smith"
}
```

---

## 2. Get Basic Refraction Exam by ID

### Request
**GET** `/api/basic-refraction-exams/{id}`

### Response
**Status**: `200 OK`

```json
{
  "id": 1,
  "visitSessionId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  
  // All fields as in create response...
  "neuroOriented": true,
  "neuroMood": "Alert and cooperative",
  "pupilSizeRight": 4.5,
  "iopRight": 18,
  "colorVisionRight": "Normal",
  "stereopsis": 40,
  "nearAdditionRight": 1.50,
  "clinicalAssessment": "Patient presents with moderate myopia and early presbyopia",
  "diagnosis": "Myopia with astigmatism and presbyopia",
  "treatmentPlan": "Prescribe progressive lenses with anti-reflective coating",
  "equipmentUsed": "Autorefractor, Keratometer, Tonometer, Color Vision Test",
  "equipmentCalibrationDate": "2025-01-01",
  "comment": "Comprehensive eye examination completed.",
  "examinedBy": "Dr. Smith",
  "examinationDate": "2025-08-12T10:30:00",
  "createdAt": "2025-08-12T10:30:00",
  "updatedAt": "2025-08-12T10:30:00",
  "createdBy": "Dr. Smith",
  "updatedBy": "Dr. Smith"
}
```

---

## 3. Get Basic Refraction Exam by Visit Session ID

### Request
**GET** `/api/basic-refraction-exams/visit-session/{visitSessionId}`

### Response
**Status**: `200 OK`

```json
{
  "id": 1,
  "visitSessionId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  
  // All fields as in create response...
  "neuroOriented": true,
  "pupilSizeRight": 4.5,
  "iopRight": 18,
  "colorVisionRight": "Normal",
  "stereopsis": 40,
  "nearAdditionRight": 1.50,
  "clinicalAssessment": "Patient presents with moderate myopia and early presbyopia",
  "diagnosis": "Myopia with astigmatism and presbyopia",
  "treatmentPlan": "Prescribe progressive lenses with anti-reflective coating",
  "equipmentUsed": "Autorefractor, Keratometer, Tonometer, Color Vision Test",
  "equipmentCalibrationDate": "2025-01-01",
  "comment": "Comprehensive eye examination completed.",
  "examinedBy": "Dr. Smith",
  "examinationDate": "2025-08-12T10:30:00",
  "createdAt": "2025-08-12T10:30:00",
  "updatedAt": "2025-08-12T10:30:00",
  "createdBy": "Dr. Smith",
  "updatedBy": "Dr. Smith"
}
```

---

## 4. Get All Basic Refraction Exams

### Request
**GET** `/api/basic-refraction-exams`

### Response
**Status**: `200 OK`

```json
[
  {
    "id": 1,
    "visitSessionId": 1,
    "patientName": "John Doe",
    "patientPhone": "1234567890",
    "neuroOriented": true,
    "pupilSizeRight": 4.5,
    "iopRight": 18,
    "colorVisionRight": "Normal",
    "stereopsis": 40,
    "nearAdditionRight": 1.50,
    "clinicalAssessment": "Patient presents with moderate myopia and early presbyopia",
    "diagnosis": "Myopia with astigmatism and presbyopia",
    "treatmentPlan": "Prescribe progressive lenses with anti-reflective coating",
    "equipmentUsed": "Autorefractor, Keratometer, Tonometer, Color Vision Test",
    "equipmentCalibrationDate": "2025-01-01",
    "comment": "Comprehensive eye examination completed.",
    "examinedBy": "Dr. Smith",
    "examinationDate": "2025-08-12T10:30:00",
    "createdAt": "2025-08-12T10:30:00",
    "updatedAt": "2025-08-12T10:30:00",
    "createdBy": "Dr. Smith",
    "updatedBy": "Dr. Smith"
  },
  {
    "id": 2,
    "visitSessionId": 2,
    "patientName": "Jane Smith",
    "patientPhone": "9876543210",
    "neuroOriented": true,
    "pupilSizeRight": 4.0,
    "iopRight": 16,
    "colorVisionRight": "Normal",
    "stereopsis": 30,
    "nearAdditionRight": 1.75,
    "clinicalAssessment": "Patient shows hyperopia with astigmatism",
    "diagnosis": "Hyperopia with astigmatism and presbyopia",
    "treatmentPlan": "Prescribe bifocal lenses",
    "equipmentUsed": "Autorefractor, Keratometer, Tonometer",
    "equipmentCalibrationDate": "2025-01-15",
    "comment": "Patient examination completed successfully.",
    "examinedBy": "Dr. Johnson",
    "examinationDate": "2025-08-12T11:00:00",
    "createdAt": "2025-08-12T11:00:00",
    "updatedAt": "2025-08-12T11:00:00",
    "createdBy": "Dr. Johnson",
    "updatedBy": "Dr. Johnson"
  }
]
```

---

## 5. Update Basic Refraction Exam

### Request
**PUT** `/api/basic-refraction-exams/{id}`

```json
{
  "visitSessionId": 1,
  
  // Updated values
  "neuroMood": "Alert and cooperative - updated",
  "pupilSizeRight": 4.0,
  "pupilSizeLeft": 4.0,
  "pupilSizeUnit": "mm",
  "iopRight": 16,
  "iopLeft": 16,
  "iopMethod": "GOLDMANN_TONOMETRY",
  "colorVisionRight": "Normal",
  "colorVisionLeft": "Normal",
  "colorVisionTest": "ISHIHARA",
  "stereopsis": 30,
  "stereopsisUnit": "arcseconds",
  "nearAdditionRight": 1.75,
  "nearAdditionLeft": 1.75,
  "clinicalAssessment": "Updated: Patient shows good ocular health",
  "diagnosis": "Updated: Myopia with astigmatism and presbyopia",
  "treatmentPlan": "Updated: Progressive lenses recommended",
  "equipmentUsed": "Updated equipment list",
  "equipmentCalibrationDate": "2025-01-15",
  "comment": "Updated: Enhanced comprehensive eye examination completed successfully."
}
```

### Response
**Status**: `200 OK`

```json
{
  "id": 1,
  "visitSessionId": 1,
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  
  // Updated values
  "neuroMood": "Alert and cooperative - updated",
  "pupilSizeRight": 4.0,
  "pupilSizeLeft": 4.0,
  "pupilSizeUnit": "mm",
  "iopRight": 16,
  "iopLeft": 16,
  "iopMethod": "GOLDMANN_TONOMETRY",
  "colorVisionRight": "Normal",
  "colorVisionLeft": "Normal",
  "colorVisionTest": "ISHIHARA",
  "stereopsis": 30,
  "stereopsisUnit": "arcseconds",
  "nearAdditionRight": 1.75,
  "nearAdditionLeft": 1.75,
  "clinicalAssessment": "Updated: Patient shows good ocular health",
  "diagnosis": "Updated: Myopia with astigmatism and presbyopia",
  "treatmentPlan": "Updated: Progressive lenses recommended",
  "equipmentUsed": "Updated equipment list",
  "equipmentCalibrationDate": "2025-01-15",
  "comment": "Updated: Enhanced comprehensive eye examination completed successfully.",
  "examinedBy": "Dr. Smith",
  "examinationDate": "2025-08-12T10:30:00",
  "createdAt": "2025-08-12T10:30:00",
  "updatedAt": "2025-08-12T11:45:00",
  "createdBy": "Dr. Smith",
  "updatedBy": "Dr. Smith"
}
```

---

## 6. Delete Basic Refraction Exam

### Request
**DELETE** `/api/basic-refraction-exams/{id}`

### Response
**Status**: `204 No Content`

---

## New Enhanced Fields Summary

### Pupil Measurements
- `pupilSizeRight`: Double - Right eye pupil size
- `pupilSizeLeft`: Double - Left eye pupil size  
- `pupilSizeUnit`: String - Unit of measurement (e.g., "mm")

### Intraocular Pressure (IOP)
- `iopRight`: Integer - Right eye IOP measurement
- `iopLeft`: Integer - Left eye IOP measurement
- `iopMethod`: String - Method used (e.g., "GOLDMANN_TONOMETRY")

### Color Vision Testing
- `colorVisionRight`: String - Right eye color vision result
- `colorVisionLeft`: String - Left eye color vision result
- `colorVisionTest`: String - Test used (e.g., "ISHIHARA")

### Stereopsis Measurement
- `stereopsis`: Integer - Stereopsis measurement value
- `stereopsisUnit`: String - Unit of measurement (e.g., "arcseconds")

### Near Addition for Presbyopia
- `nearAdditionRight`: Double - Right eye near addition
- `nearAdditionLeft`: Double - Left eye near addition

### Clinical Assessment
- `clinicalAssessment`: String - Clinical assessment notes
- `diagnosis`: String - Clinical diagnosis
- `treatmentPlan`: String - Recommended treatment plan

### Equipment Tracking
- `equipmentUsed`: String - Equipment used during examination
- `equipmentCalibrationDate`: Date - Equipment calibration date

### Patient Information (Response Only)
- `patientName`: String - Patient's full name
- `patientPhone`: String - Patient's phone number
