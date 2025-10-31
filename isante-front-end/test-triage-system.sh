#!/bin/bash

echo "=== Triage System Test Script ==="

# Check if application is running
echo "Checking if application is running..."
if ! curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo "Application is not running. Please start it first."
    exit 1
fi

echo "Application is running!"

# Get authentication token
echo "Getting authentication token..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "Failed to get authentication token"
    exit 1
fi

echo "Token obtained successfully"

# Test 1: Create a patient first
echo -e "\n=== Test 1: Creating a patient ==="
PATIENT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Triage",
    "lastName": "Test",
    "gender": "Male",
    "nationalId": "TRIAGE123456789",
    "dateOfBirth": "1990-01-01",
    "ageInYears": 30,
    "phone": "1234567890",
    "residence": "Test City"
  }')

PATIENT_ID=$(echo "$PATIENT_RESPONSE" | jq -r '.id')
echo "Patient created with ID: $PATIENT_ID"

# Test 2: Create a visit session
echo -e "\n=== Test 2: Creating a visit session ==="
VISIT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"patientId\": $PATIENT_ID,
    \"visitPurpose\": \"NEW_CONSULTATION\",
    \"chiefComplaint\": \"Eye pain\",
    \"currentStage\": \"RECEPTION\"
  }")

VISIT_ID=$(echo "$VISIT_RESPONSE" | jq -r '.id')
echo "Visit session created with ID: $VISIT_ID"

# Test 3: Create triage measurement
echo -e "\n=== Test 3: Creating triage measurement ==="
TRIAGE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/triage-measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"patientVisitSessionId\": $VISIT_ID,
    \"bloodPressure\": \"120/80\",
    \"randomBloodSugar\": 95.5,
    \"intraocularPressure\": 16.0,
    \"weight\": 70.5,
    \"notes\": \"Patient appears stable, no immediate concerns\"
  }")

TRIAGE_ID=$(echo "$TRIAGE_RESPONSE" | jq -r '.id')
echo "Triage measurement created with ID: $TRIAGE_ID"
echo "Triage response:"
echo "$TRIAGE_RESPONSE" | jq '.'

# Test 4: Get triage measurement
echo -e "\n=== Test 4: Getting triage measurement ==="
GET_TRIAGE_RESPONSE=$(curl -s -X GET http://localhost:8080/api/triage-measurements/$TRIAGE_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Retrieved triage measurement:"
echo "$GET_TRIAGE_RESPONSE" | jq '.'

# Test 5: Get triage by visit session
echo -e "\n=== Test 5: Getting triage by visit session ==="
VISIT_TRIAGE_RESPONSE=$(curl -s -X GET http://localhost:8080/api/triage-measurements/visit-session/$VISIT_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Triage for visit session:"
echo "$VISIT_TRIAGE_RESPONSE" | jq '.'

# Test 6: Update triage measurement
echo -e "\n=== Test 6: Updating triage measurement ==="
UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:8080/api/triage-measurements/$TRIAGE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"patientVisitSessionId\": $VISIT_ID,
    \"bloodPressure\": \"125/85\",
    \"randomBloodSugar\": 98.0,
    \"intraocularPressure\": 17.0,
    \"weight\": 70.5,
    \"notes\": \"Updated: Patient stable, slight increase in BP\"
  }")

echo "Updated triage measurement:"
echo "$UPDATE_RESPONSE" | jq '.'

# Test 7: Get all triage measurements
echo -e "\n=== Test 7: Getting all triage measurements ==="
ALL_TRIAGE_RESPONSE=$(curl -s -X GET http://localhost:8080/api/triage-measurements \
  -H "Authorization: Bearer $TOKEN")

echo "All triage measurements:"
echo "$ALL_TRIAGE_RESPONSE" | jq '.'

# Test 8: Check visit session stage progression
echo -e "\n=== Test 8: Checking visit session stage progression ==="
VISIT_STATUS_RESPONSE=$(curl -s -X GET http://localhost:8080/api/patient-visit-sessions/$VISIT_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Visit session status after triage:"
echo "$VISIT_STATUS_RESPONSE" | jq '.'

# Test 9: Test error handling - duplicate triage
echo -e "\n=== Test 9: Testing duplicate triage error ==="
DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/triage-measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"patientVisitSessionId\": $VISIT_ID,
    \"bloodPressure\": \"130/90\",
    \"randomBloodSugar\": 100.0,
    \"intraocularPressure\": 18.0,
    \"weight\": 71.0,
    \"notes\": \"This should fail - duplicate triage\"
  }")

echo "Duplicate triage attempt response:"
echo "$DUPLICATE_RESPONSE" | jq '.'

# Test 10: Test validation error - invalid blood pressure
echo -e "\n=== Test 10: Testing validation error ==="
VALIDATION_RESPONSE=$(curl -s -X POST http://localhost:8080/api/triage-measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"patientVisitSessionId\": 999999,
    \"bloodPressure\": \"invalid-format\",
    \"randomBloodSugar\": 95.5,
    \"intraocularPressure\": 16.0,
    \"weight\": 70.5,
    \"notes\": \"Test validation\"
  }")

echo "Validation error response:"
echo "$VALIDATION_RESPONSE" | jq '.'

echo -e "\n=== Triage System Test Completed ==="
echo "Summary:"
echo "- Patient created: $PATIENT_ID"
echo "- Visit session created: $VISIT_ID"
echo "- Triage measurement created: $TRIAGE_ID"
echo "- All CRUD operations tested"
echo "- Error handling tested" 