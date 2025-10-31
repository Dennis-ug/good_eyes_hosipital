#!/bin/bash

echo "Testing patient visit session creation..."

# Test data for visit session creation
TEST_VISIT_SESSION='{
  "patientId": 1,
  "visitPurpose": "NEW_CONSULTATION",
  "chiefComplaint": "Eye pain and blurry vision",
  "requiresTriage": true,
  "requiresDoctorVisit": true,
  "isEmergency": false,
  "consultationFeePaid": false,
  "consultationFeeAmount": 50.00,
  "paymentMethod": null,
  "paymentReference": null,
  "previousVisitId": null,
  "emergencyLevel": "NONE",
  "notes": "Patient complaining of eye pain",
  "currentStage": "RECEPTION"
}'

echo "Creating test visit session..."
curl -X POST http://localhost:5025/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d "$TEST_VISIT_SESSION"

if [ $? -eq 0 ]; then
    echo "✅ Visit session creation successful!"
else
    echo "❌ Visit session creation failed. Check the error message above."
fi 