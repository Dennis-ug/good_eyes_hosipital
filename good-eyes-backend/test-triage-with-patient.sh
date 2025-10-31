#!/bin/bash

echo "Testing Triage Response with Patient Details..."

# Get authentication token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "Failed to get authentication token"
    exit 1
fi

echo "Token obtained successfully"

# Create a patient first
echo "Creating a patient..."
PATIENT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "nationalId": "PATIENT123456789",
    "dateOfBirth": "1990-01-01",
    "ageInYears": 30,
    "phone": "1234567890",
    "residence": "Test City"
  }')

PATIENT_ID=$(echo "$PATIENT_RESPONSE" | jq -r '.id')
echo "Patient created with ID: $PATIENT_ID"

# Create a visit session
echo "Creating a visit session..."
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

# Create triage measurement
echo "Creating triage measurement..."
TRIAGE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/triage-measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"visitSessionId\": $VISIT_ID,
    \"systolicBp\": 120,
    \"diastolicBp\": 80,
    \"rbsValue\": 95.5,
    \"rbsUnit\": \"mg/dL\",
    \"iopRight\": 16,
    \"iopLeft\": 16,
    \"weightKg\": 70.5,
    \"notes\": \"Patient appears stable\"
  }")

TRIAGE_ID=$(echo "$TRIAGE_RESPONSE" | jq -r '.id')
echo "Triage measurement created with ID: $TRIAGE_ID"

# Test getting triage by ID (should include patient details)
echo -e "\n=== Testing Get Triage by ID ==="
GET_BY_ID_RESPONSE=$(curl -s -X GET http://localhost:8080/api/triage-measurements/$TRIAGE_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Triage by ID response:"
echo "$GET_BY_ID_RESPONSE" | jq '.'

# Check if patient details are included
PATIENT_NAME=$(echo "$GET_BY_ID_RESPONSE" | jq -r '.patientName')
PATIENT_PHONE=$(echo "$GET_BY_ID_RESPONSE" | jq -r '.patientPhone')

if [ "$PATIENT_NAME" != "null" ] && [ "$PATIENT_PHONE" != "null" ]; then
    echo "✅ Patient details included:"
    echo "   Name: $PATIENT_NAME"
    echo "   Phone: $PATIENT_PHONE"
else
    echo "❌ Patient details missing!"
fi

# Test getting triage by visit session ID
echo -e "\n=== Testing Get Triage by Visit Session ID ==="
GET_BY_VISIT_RESPONSE=$(curl -s -X GET http://localhost:8080/api/triage-measurements/visit-session/$VISIT_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Triage by visit session response:"
echo "$GET_BY_VISIT_RESPONSE" | jq '.'

# Test getting all triage measurements
echo -e "\n=== Testing Get All Triage Measurements ==="
GET_ALL_RESPONSE=$(curl -s -X GET http://localhost:8080/api/triage-measurements \
  -H "Authorization: Bearer $TOKEN")

echo "All triage measurements response:"
echo "$GET_ALL_RESPONSE" | jq '.'

# Check if all responses include patient details
echo -e "\n=== Summary ==="
echo "Patient Name in responses:"
echo "  - By ID: $(echo "$GET_BY_ID_RESPONSE" | jq -r '.patientName')"
echo "  - By Visit: $(echo "$GET_BY_VISIT_RESPONSE" | jq -r '.patientName')"
echo "  - All: $(echo "$GET_ALL_RESPONSE" | jq -r '.[0].patientName')"

echo -e "\nPatient Phone in responses:"
echo "  - By ID: $(echo "$GET_BY_ID_RESPONSE" | jq -r '.patientPhone')"
echo "  - By Visit: $(echo "$GET_BY_VISIT_RESPONSE" | jq -r '.patientPhone')"
echo "  - All: $(echo "$GET_ALL_RESPONSE" | jq -r '.[0].patientPhone')"

echo -e "\n✅ Test completed!" 