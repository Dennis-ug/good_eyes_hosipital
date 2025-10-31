#!/bin/bash

echo "Testing Patient Number Generation..."

# Test creating a patient and verify patient number is generated
echo "Creating a new patient..."
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "nationalId": "123456789012345",
    "dateOfBirth": "1990-01-01",
    "ageInYears": 33,
    "phone": "1234567890",
    "residence": "Kampala"
  }' | jq '.'

echo -e "\n\nCreating another patient to verify sequential numbering..."
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "gender": "Female",
    "nationalId": "987654321098765",
    "dateOfBirth": "1985-05-15",
    "ageInYears": 38,
    "phone": "0987654321",
    "residence": "Entebbe"
  }' | jq '.'

echo -e "\n\nGetting all patients to verify patient numbers..."
curl -X GET http://localhost:8080/api/patients \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  | jq '.content[] | {id, patientNumber, firstName, lastName}'

echo -e "\n\nPatient number generation test completed!" 