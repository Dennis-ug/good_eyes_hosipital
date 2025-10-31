#!/bin/bash

echo "Testing Enhanced Basic Refraction Exam API with all new fields..."

# Login and get token
echo "Logging in..."
TOKEN=$(curl -s -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "Failed to get token. Exiting."
    exit 1
fi

echo "Token obtained successfully"

# Create a test patient
echo "Creating a test patient..."
PATIENT_RESPONSE=$(curl -s -X POST http://localhost:5025/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Enhanced",
    "lastName": "Test",
    "gender": "Male",
    "nationalId": "ENHANCED123456789",
    "dateOfBirth": "1980-03-20",
    "ageInYears": 44,
    "phone": "9876543211",
    "residence": "Test City"
  }')

PATIENT_ID=$(echo $PATIENT_RESPONSE | jq -r '.id')
echo "Patient created with ID: $PATIENT_ID"

# Create a visit session
echo "Creating a visit session..."
VISIT_SESSION_RESPONSE=$(curl -s -X POST http://localhost:5025/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patientId": '$PATIENT_ID',
    "visitPurpose": "CONSULTATION",
    "consultationFee": 75.00
  }')

VISIT_SESSION_ID=$(echo $VISIT_SESSION_RESPONSE | jq -r '.id')
echo "Visit session created with ID: $VISIT_SESSION_ID"

# Mark payment as completed
echo "Marking payment as completed..."
curl -s -X POST http://localhost:5025/api/patient-visit-sessions/$VISIT_SESSION_ID/mark-paid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentMethod": "CASH",
    "paymentReference": "PAYREF789"
  }' | jq '.'

# Progress to triage
echo "Progressing to triage..."
curl -s -X POST http://localhost:5025/api/patient-visit-sessions/$VISIT_SESSION_ID/progress \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Create triage measurement
echo "Creating triage measurement..."
curl -s -X POST http://localhost:5025/api/triage-measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "visitSessionId": '$VISIT_SESSION_ID',
    "systolicBp": 125,
    "diastolicBp": 82,
    "rbsValue": 98.0,
    "iopRight": 18,
    "iopLeft": 17,
    "weightKg": 72.0,
    "notes": "Patient stable for enhanced refraction"
  }' | jq '.'

# Progress to basic refraction exam
echo "Progressing to basic refraction exam..."
curl -s -X POST http://localhost:5025/api/patient-visit-sessions/$VISIT_SESSION_ID/progress \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Create enhanced basic refraction exam with ALL new fields
echo "Creating enhanced basic refraction exam with all new fields..."
ENHANCED_REFRACTION_RESPONSE=$(curl -s -X POST http://localhost:5025/api/basic-refraction-exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "visitSessionId": '$VISIT_SESSION_ID',
    "neuroOriented": true,
    "neuroMood": "Alert and cooperative",
    "neuroPsychNotes": "Patient shows good cognitive function",
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
    "pupilSizeRight": 4.5,
    "pupilSizeLeft": 4.5,
    "pupilSizeUnit": "mm",
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
    "keratometryK1Right": 43.50,
    "keratometryK2Right": 44.25,
    "keratometryAxisRight": 90,
    "keratometryK1Left": 43.75,
    "keratometryK2Left": 44.00,
    "keratometryAxisLeft": 85,
    "manifestAutoRightSphere": -2.00,
    "manifestAutoRightCylinder": -0.75,
    "manifestAutoRightAxis": 90,
    "manifestAutoLeftSphere": -1.75,
    "manifestAutoLeftCylinder": -0.50,
    "manifestAutoLeftAxis": 85,
    "manifestRetRightSphere": -1.75,
    "manifestRetRightCylinder": -0.50,
    "manifestRetRightAxis": 90,
    "manifestRetLeftSphere": -1.50,
    "manifestRetLeftCylinder": -0.25,
    "manifestRetLeftAxis": 85,
    "subjectiveRightSphere": -1.75,
    "subjectiveRightCylinder": -0.50,
    "subjectiveRightAxis": 90,
    "subjectiveLeftSphere": -1.50,
    "subjectiveLeftCylinder": -0.25,
    "subjectiveLeftAxis": 85,
    "addedValues": "+1.50",
    "bestRightVision": "20/20",
    "bestLeftVision": "20/20",
    "pdRightEye": 32.0,
    "pdLeftEye": 32.0,
    "refractionNotes": "Patient shows moderate myopia with astigmatism",
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
    "clinicalAssessment": "Patient presents with moderate myopia and early presbyopia",
    "diagnosis": "Myopia with astigmatism and presbyopia",
    "treatmentPlan": "Prescribe progressive lenses with anti-reflective coating",
    "equipmentUsed": "Autorefractor, Keratometer, Tonometer, Color Vision Test",
    "equipmentCalibrationDate": "2025-01-01",
    "comment": "Comprehensive eye examination completed with all enhanced fields.",
    "examinedBy": "Dr. Enhanced Test"
  }')

ENHANCED_REFRACTION_ID=$(echo $ENHANCED_REFRACTION_RESPONSE | jq -r '.id')
echo "Enhanced basic refraction exam created with ID: $ENHANCED_REFRACTION_ID"

# Display the created exam
echo "Created enhanced basic refraction exam:"
echo $ENHANCED_REFRACTION_RESPONSE | jq '.'

# Test getting the exam by ID
echo "Fetching enhanced basic refraction exam by ID..."
curl -s -X GET http://localhost:5025/api/basic-refraction-exams/$ENHANCED_REFRACTION_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo "Enhanced Basic Refraction Exam API testing completed!"
echo "Created:"
echo "  - Patient ID: $PATIENT_ID"
echo "  - Visit Session ID: $VISIT_SESSION_ID"
echo "  - Enhanced Basic Refraction Exam ID: $ENHANCED_REFRACTION_ID"

