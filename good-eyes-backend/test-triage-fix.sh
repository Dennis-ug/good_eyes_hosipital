#!/bin/bash
echo "Testing Triage Fix..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"username":"superadmin","password":"admin123"}' | jq -r '.token')
echo "Testing triage creation with DTO format..."
curl -s -X POST http://localhost:8080/api/triage-measurements -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"visitSessionId": 1, "systolicBp": 120, "diastolicBp": 80, "rbsValue": 95.5, "notes": "Test"}' | jq '.'
