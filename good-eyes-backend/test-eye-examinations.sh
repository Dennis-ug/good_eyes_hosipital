#!/bin/bash

echo "Testing Eye Examination Functionality"
echo "===================================="

# Test 1: Login as optometrist
echo "1. Logging in as optometrist..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5025/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"optometrist","password":"optometrist123"}')

if [ $? -eq 0 ]; then
    echo "✅ Optometrist login successful"
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "Access token obtained: ${ACCESS_TOKEN:0:20}..."
else
    echo "❌ Optometrist login failed"
    exit 1
fi

# Test 2: Get patients for examination
echo "2. Getting patients for eye examination..."
PATIENTS_RESPONSE=$(curl -s -X GET http://localhost:5025/api/optometry/patients-for-examination \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $PATIENTS_RESPONSE == *"firstName"* ]]; then
    echo "✅ Patients retrieved successfully"
    PATIENT_ID=$(echo $PATIENTS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "Using patient ID: $PATIENT_ID"
else
    echo "❌ Failed to get patients"
    echo "Response: $PATIENTS_RESPONSE"
    exit 1
fi

# Test 3: Perform eye examination
echo "3. Performing eye examination..."
EXAMINATION_DATA='{
  "chiefComplaint": "Blurred vision",
  "visualAcuityRight": "20/40",
  "visualAcuityLeft": "20/30",
  "intraocularPressureRight": 16.5,
  "intraocularPressureLeft": 15.8,
  "refractionRight": "-2.50 -0.50 x 90",
  "refractionLeft": "-2.00 -0.25 x 85",
  "diagnosis": "Myopia with astigmatism",
  "treatmentPlan": "Prescription glasses",
  "nextAppointment": "2024-02-15",
  "eyeHistory": "No previous eye problems",
  "familyEyeHistory": "Father has myopia",
  "notes": "Patient reports difficulty reading small text"
}'

EXAMINATION_RESPONSE=$(curl -s -X POST http://localhost:5025/api/optometry/examine-patient/$PATIENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$EXAMINATION_DATA")

if [[ $EXAMINATION_RESPONSE == *"diagnosis"* ]] && [[ $EXAMINATION_RESPONSE == *"Myopia"* ]]; then
    echo "✅ Eye examination performed successfully"
    EXAMINATION_ID=$(echo $EXAMINATION_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "Examination ID: $EXAMINATION_ID"
else
    echo "❌ Eye examination failed"
    echo "Response: $EXAMINATION_RESPONSE"
fi

# Test 4: Get examinations by diagnosis
echo "4. Getting examinations with diagnosis 'Myopia'..."
DIAGNOSIS_RESPONSE=$(curl -s -X GET http://localhost:5025/api/optometry/patients-with-diagnosis/Myopia \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $DIAGNOSIS_RESPONSE == *"diagnosis"* ]]; then
    echo "✅ Examinations with diagnosis retrieved successfully"
else
    echo "❌ Failed to get examinations by diagnosis"
    echo "Response: $DIAGNOSIS_RESPONSE"
fi

# Test 5: Get patient's eye examinations
echo "5. Getting all eye examinations for patient..."
PATIENT_EXAMINATIONS_RESPONSE=$(curl -s -X GET http://localhost:5025/api/eye-examinations/patient/$PATIENT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $PATIENT_EXAMINATIONS_RESPONSE == *"examinationDate"* ]]; then
    echo "✅ Patient eye examinations retrieved successfully"
else
    echo "❌ Failed to get patient eye examinations"
    echo "Response: $PATIENT_EXAMINATIONS_RESPONSE"
fi

# Test 6: Get latest eye examination
echo "6. Getting latest eye examination for patient..."
LATEST_EXAMINATION_RESPONSE=$(curl -s -X GET http://localhost:5025/api/eye-examinations/patient/$PATIENT_ID/latest \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $LATEST_EXAMINATION_RESPONSE == *"diagnosis"* ]]; then
    echo "✅ Latest eye examination retrieved successfully"
else
    echo "❌ Failed to get latest eye examination"
    echo "Response: $LATEST_EXAMINATION_RESPONSE"
fi

echo ""
echo "Eye examination functionality test completed!" 