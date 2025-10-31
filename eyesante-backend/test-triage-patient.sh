#!/bin/bash
echo "Testing Triage with Patient Details..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"username":"superadmin","password":"admin123"}' | jq -r '.token')
echo "Testing triage response with patient details..."
curl -s -X GET http://localhost:8080/api/triage-measurements/1 -H "Authorization: Bearer $TOKEN" | jq '.patientName, .patientPhone'
