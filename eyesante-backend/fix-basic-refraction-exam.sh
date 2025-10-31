#!/bin/bash

echo "Fixing Basic Refraction Exam - Updating existing record with enhanced fields..."

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

# Get existing Basic Refraction Exam ID for visit session 2
echo "Fetching existing Basic Refraction Exam for visit session 2..."
EXISTING_EXAM=$(curl -s -X GET http://localhost:5025/api/basic-refraction-exams/visit-session/2 \
  -H "Authorization: Bearer $TOKEN")

EXISTING_EXAM_ID=$(echo $EXISTING_EXAM | jq -r '.id')
echo "Found existing exam with ID: $EXISTING_EXAM_ID"

if [ "$EXISTING_EXAM_ID" = "null" ] || [ -z "$EXISTING_EXAM_ID" ]; then
    echo "No existing exam found for visit session 2. Creating new one..."
    
    # Create new exam with enhanced fields
    NEW_EXAM_RESPONSE=$(curl -s -X POST http://localhost:5025/api/basic-refraction-exams \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "visitSessionId": 2,
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
    
    NEW_EXAM_ID=$(echo $NEW_EXAM_RESPONSE | jq -r '.id')
    echo "Created new exam with ID: $NEW_EXAM_ID"
    echo "New exam response:"
    echo $NEW_EXAM_RESPONSE | jq '.'
    
else
    echo "Updating existing exam with enhanced fields..."
    
    # Update existing exam with enhanced fields
    UPDATED_EXAM_RESPONSE=$(curl -s -X PUT http://localhost:5025/api/basic-refraction-exams/$EXISTING_EXAM_ID \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "visitSessionId": 2,
        "neuroOriented": true,
        "neuroMood": "Alert and cooperative - Enhanced",
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
        "comment": "Enhanced comprehensive eye examination completed with all new fields.",
        "examinedBy": "Dr. Enhanced Test"
      }')
    
    echo "Updated exam response:"
    echo $UPDATED_EXAM_RESPONSE | jq '.'
fi

# Verify the fix by fetching the exam
echo "Verifying the fix by fetching the exam..."
curl -s -X GET http://localhost:5025/api/basic-refraction-exams/$EXISTING_EXAM_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo "Basic Refraction Exam fix completed!"

