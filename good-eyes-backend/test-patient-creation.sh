#!/bin/bash

echo "Testing patient creation..."

# Test data for patient creation
TEST_PATIENT='{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "phone": "1234567890",
  "nationalId": "123456789",
  "dateOfBirth": "1990-01-01",
  "ageInYears": 33,
  "maritalStatus": "Single",
  "religion": "Christian",
  "occupation": "Engineer",
  "nextOfKin": "Jane Doe",
  "nextOfKinRelationship": "Spouse",
  "nextOfKinPhone": "0987654321",
  "residence": "Kampala",
  "patientCategory": "Regular",
  "citizenship": "Ugandan"
}'

echo "Creating test patient..."
curl -X POST http://localhost:5025/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d "$TEST_PATIENT"

if [ $? -eq 0 ]; then
    echo "✅ Patient creation successful!"
else
    echo "❌ Patient creation failed. Check the error message above."
fi 