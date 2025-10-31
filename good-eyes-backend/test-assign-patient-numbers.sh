#!/bin/bash

echo "Assigning Patient Numbers to Existing Patients..."

# Assign patient numbers to existing patients
echo "Calling the assign patient numbers endpoint..."
curl -X POST http://localhost:8080/api/patients/assign-patient-numbers \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  -H "Content-Type: application/json"

echo -e "\n\nVerifying patient numbers were assigned..."
curl -X GET http://localhost:8080/api/patients \
  -H "Authorization: Bearer $(cat token.txt 2>/dev/null || echo 'NO_TOKEN')" \
  | jq '.content[] | {id, patientNumber, firstName, lastName}'

echo -e "\n\nPatient number assignment test completed!" 