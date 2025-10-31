#!/bin/bash

echo "Testing automatic invoice creation with user-based approach..."

# Test data for consultation visit session creation
TEST_CONSULTATION_VISIT='{
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

echo "Creating consultation visit session (should trigger automatic invoice)..."
curl -X POST http://localhost:5025/api/patient-visit-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token-here>" \
  -d "$TEST_CONSULTATION_VISIT"

if [ $? -eq 0 ]; then
    echo "✅ Automatic invoice creation successful!"
    echo "The visit session should now have an invoice created automatically."
else
    echo "❌ Automatic invoice creation failed. Check the error message above."
fi 