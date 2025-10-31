#!/bin/bash

echo "Testing Sequence-Based Patient Number Generation..."

# Initialize the sequence first
echo "Initializing patient number sequence..."
curl -X POST http://localhost:8080/api/patients/initialize-sequence \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  -H "Content-Type: application/json"

echo -e "\n\nCreating multiple patients to test sequential numbering..."

# Create first patient
echo "Creating patient 1..."
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

# Create second patient
echo -e "\n\nCreating patient 2..."
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

# Create third patient
echo -e "\n\nCreating patient 3..."
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  -d '{
    "firstName": "Bob",
    "lastName": "Johnson",
    "gender": "Male",
    "nationalId": "555666777888999",
    "dateOfBirth": "1988-12-25",
    "ageInYears": 35,
    "phone": "5556667777",
    "residence": "Jinja"
  }' | jq '.'

echo -e "\n\nGetting all patients to verify sequential numbering..."
curl -X GET http://localhost:8080/api/patients \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  | jq '.content[] | {id, patientNumber, firstName, lastName}'

echo -e "\n\nSequence-based patient number generation test completed!" 