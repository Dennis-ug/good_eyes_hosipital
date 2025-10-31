#!/bin/bash

echo "Testing Patient Number Generation Directly..."

# Test the patient number generation endpoint
echo "Testing patient number generation endpoint..."
curl -X POST http://localhost:8080/api/patients/test-patient-number-generation \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  -H "Content-Type: application/json"

echo -e "\n\nTesting patient creation..."
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  -d '{
    "firstName": "Direct",
    "lastName": "Test",
    "gender": "Male",
    "nationalId": "DIRECT123456789",
    "dateOfBirth": "1990-01-01",
    "ageInYears": 30,
    "phone": "1234567890",
    "residence": "Test City"
  }' | jq '.'

echo -e "\n\nDirect test completed!" 